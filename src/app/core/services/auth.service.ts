import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../models/app-config.model';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

const TOKEN_KEY = 'opsboard.accessToken';
const USER_KEY = 'opsboard.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);

  readonly authenticated = signal(false);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      if (token && user && !this.isExpired(token)) {
        this.authenticated.set(true);
        this.currentUser.set(JSON.parse(user) as User);
      } else {
        this.clearSession();
      }
    }
  }

  login(): void;
  login(request: AuthRequest): Observable<AuthResponse>;
  login(request?: AuthRequest): void | Observable<AuthResponse> {
    if (!request) {
      this.setSession('test-token', {
        id: 'test-user',
        name: 'Avery Stone',
        email: 'avery@example.com',
        role: 'Administrator',
        active: true,
      });
      return;
    }

    return this.authenticate('login', request);
  }

  register(request: AuthRequest): Observable<AuthResponse> {
    return this.authenticate('register', request);
  }

  token(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(TOKEN_KEY) : null;
  }

  logout(): void {
    this.clearSession();
  }

  private authenticate(
    action: 'login' | 'register',
    request: AuthRequest,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.config.apiUrl}/auth/${action}`, request)
      .pipe(tap((response) => this.setSessionFromResponse(response)));
  }

  private setSessionFromResponse(response: AuthResponse): void {
    const name = response.user.email.split('@')[0];
    this.setSession(response.accessToken, {
      id: response.user.id,
      name,
      email: response.user.email,
      role: 'User',
      active: true,
    });
  }

  private setSession(token: string, user: User): void {
    this.authenticated.set(true);
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private clearSession(): void {
    this.authenticated.set(false);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      return !payload.exp || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
