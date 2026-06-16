import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { APP_CONFIG } from '../models/app-config.model';
import { AuthRequest, AuthResponse, RegistrationRequest } from '../models/auth.model';
import { User } from '../models/user.model';

interface UserResponse {
  readonly user?: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private sessionChecked = false;

  readonly authenticated = signal(false);
  readonly currentUser = signal<User | null>(null);

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.authenticate('login', request);
  }

  register(request: RegistrationRequest): Observable<AuthResponse> {
    return this.authenticate('register', request);
  }

  ensureSession(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(true);
    }

    if (this.authenticated()) {
      return of(true);
    }

    if (this.sessionChecked) {
      return of(false);
    }

    return this.loadSession().pipe(map((user) => Boolean(user)));
  }

  logout(): void {
    this.clearSession();

    if (isPlatformBrowser(this.platformId)) {
      this.http
        .post<void>(`${this.config.apiUrl}/auth/logout`, {}, { withCredentials: true })
        .subscribe({ error: () => undefined });
    }
  }

  private authenticate(
    action: 'login' | 'register',
    request: AuthRequest | RegistrationRequest,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.config.apiUrl}/auth/${action}`, request, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.user) {
            this.setSession(response.user);
          }
        }),
        switchMap((response) =>
          response.user ? of(response) : this.loadSession().pipe(map(() => response)),
        ),
      );
  }

  private loadSession(): Observable<User | null> {
    return this.http
      .get<User | UserResponse>(`${this.config.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        map((response) => this.userResponse(response)),
        tap((user) => {
          this.sessionChecked = true;
          this.setSession(user);
        }),
        catchError(() => {
          this.sessionChecked = true;
          this.clearSession();
          return of(null);
        }),
      );
  }

  private userResponse(response: User | UserResponse): User {
    const wrapped = response as UserResponse;
    return wrapped.user ?? (response as User);
  }

  private setSession(user: User): void {
    this.authenticated.set(true);
    this.currentUser.set(user);
    this.sessionChecked = true;
  }

  private clearSession(): void {
    this.authenticated.set(false);
    this.currentUser.set(null);
  }
}
