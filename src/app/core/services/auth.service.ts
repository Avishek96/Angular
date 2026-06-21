import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { API_LIST, apiUrl } from '../models/api-list.model';
import { APP_CONFIG } from '../models/app-config.model';
import { User } from '../models/user.model';

interface UserResponse {
  readonly user?: User;
}

interface PkceLoginState {
  readonly codeVerifier: string;
  readonly nonce: string;
  readonly returnUrl: string;
  readonly state: string;
  readonly createdAt: number;
}

const PKCE_STORAGE_KEY = 'opsboard.oidc.pkce';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private sessionChecked = false;

  readonly authenticated = signal(false);
  readonly currentUser = signal<User | null>(null);

  async login(returnUrl = '/'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.location.assign(await this.oidcLoginUrl(returnUrl));
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
        .post<void>(apiUrl(this.config.apiUrl, API_LIST.auth.logout), {}, { withCredentials: true })
        .subscribe({ error: () => undefined });
    }
  }

  private async oidcLoginUrl(returnUrl: string): Promise<string> {
    const loginPath = this.config.oidc.loginPath.startsWith('/')
      ? this.config.oidc.loginPath
      : `/${this.config.oidc.loginPath}`;
    const loginBaseUrl = this.config.oidc.loginBaseUrl ?? this.config.apiUrl;
    const endpoint = apiUrl(loginBaseUrl, loginPath);
    const url = new URL(endpoint, window.location.origin);
    const safeReturnUrl = this.sameOriginReturnUrl(returnUrl);
    url.searchParams.set('returnUrl', safeReturnUrl);

    if (this.config.oidc.pkce !== false) {
      const pkce = await this.createPkceLoginState(safeReturnUrl);
      sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(pkce));
      url.searchParams.set('code_challenge', await this.sha256Base64Url(pkce.codeVerifier));
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('code_verifier', pkce.codeVerifier);
      url.searchParams.set('nonce', pkce.nonce);
      url.searchParams.set('state', pkce.state);
    }

    return url.toString();
  }

  private loadSession(): Observable<User | null> {
    return this.http
      .get<User | UserResponse>(apiUrl(this.config.apiUrl, API_LIST.auth.me), {
        withCredentials: true,
      })
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

  private async createPkceLoginState(returnUrl: string): Promise<PkceLoginState> {
    return {
      codeVerifier: this.randomBase64Url(64),
      nonce: this.randomBase64Url(32),
      returnUrl,
      state: this.randomBase64Url(32),
      createdAt: Date.now(),
    };
  }

  private randomBase64Url(byteLength: number): string {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return this.base64Url(bytes);
  }

  private async sha256Base64Url(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return this.base64Url(new Uint8Array(digest));
  }

  private base64Url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
