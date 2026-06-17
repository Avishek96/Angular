import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { APP_CONFIG } from '../models/app-config.model';
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

  login(returnUrl = '/'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.location.assign(this.oidcLoginUrl(returnUrl));
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

  private oidcLoginUrl(returnUrl: string): string {
    const loginPath = this.config.oidc.loginPath.startsWith('/')
      ? this.config.oidc.loginPath
      : `/${this.config.oidc.loginPath}`;
    const endpoint = `${this.config.apiUrl.replace(/\/$/, '')}${loginPath}`;
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('returnUrl', this.sameOriginReturnUrl(returnUrl));
    return url.toString();
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

  private sameOriginReturnUrl(returnUrl: string): string {
    try {
      const url = new URL(returnUrl, window.location.origin);
      return url.origin === window.location.origin ? url.toString() : window.location.origin;
    } catch {
      return window.location.origin;
    }
  }
}
