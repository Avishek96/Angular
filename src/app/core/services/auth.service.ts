import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../models/app-config.model';
import { AuthRequest, AuthResponse, RegistrationRequest } from '../models/auth.model';
import { User } from '../models/user.model';

const TOKEN_KEY = 'opsboard.accessToken';
const CLAIMS = {
  id: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
} as const;

interface JwtClaims {
  readonly sub?: string;
  readonly email?: string;
  readonly name?: string;
  readonly unique_name?: string;
  readonly role?: string | readonly string[];
  readonly active?: boolean | string;
  readonly exp?: number;
  readonly [claim: string]: unknown;
}

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
      if (token && !this.isExpired(token)) {
        const user = this.userFromToken(token);
        if (user) {
          this.authenticated.set(true);
          this.currentUser.set(user);
          return;
        }
      }

      this.clearSession();
    }
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.authenticate('login', request);
  }

  register(request: RegistrationRequest): Observable<AuthResponse> {
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
    request: AuthRequest | RegistrationRequest,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.config.apiUrl}/auth/${action}`, request)
      .pipe(tap((response) => this.setSessionFromResponse(response)));
  }

  private setSessionFromResponse(response: AuthResponse): void {
    const user = this.userFromToken(response.accessToken);
    if (!user) {
      throw new Error('The access token does not contain valid user claims.');
    }

    this.setSession(response.accessToken, user);
  }

  private userFromToken(token: string): User | null {
    const claims = this.decodeToken(token);
    if (!claims) {
      return null;
    }

    const id = this.claimString(claims, 'sub', CLAIMS.id);
    const email = this.claimString(claims, 'email', CLAIMS.email);
    if (!id || !email) {
      return null;
    }

    const roleClaim = claims['role'] ?? claims[CLAIMS.role];
    const role = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
    const name =
      this.claimString(claims, 'name', 'unique_name', CLAIMS.name) ?? email.split('@')[0];

    return {
      id,
      name,
      email,
      role: typeof role === 'string' ? role : 'User',
      active: claims.active !== false && claims.active !== 'false',
    };
  }

  private claimString(claims: JwtClaims, ...names: readonly string[]): string | null {
    for (const name of names) {
      const value = claims[name];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return null;
  }

  private decodeToken(token: string): JwtClaims | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)) as JwtClaims;
    } catch {
      return null;
    }
  }

  private setSession(token: string, user: User): void {
    this.authenticated.set(true);
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private clearSession(): void {
    this.authenticated.set(false);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private isExpired(token: string): boolean {
    const claims = this.decodeToken(token);
    return !claims?.exp || claims.exp * 1000 <= Date.now();
  }
}
