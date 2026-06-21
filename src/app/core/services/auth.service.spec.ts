import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { APP_CONFIG, AppConfig } from '../models/app-config.model';
import { AuthService } from './auth.service';

const config: AppConfig = {
  production: false,
  apiUrl: '/api',
  oidc: {
    loginPath: '/auth/oidc/login',
    pkce: true,
  },
};

type AuthServiceInternals = {
  oidcLoginUrl(returnUrl: string): Promise<string>;
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: config },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => http.verify());

  it('loads the authenticated user from the API session cookie', () => {
    service.ensureSession().subscribe();

    const meRequest = http.expectOne('/api/auth/me');
    expect(meRequest.request.withCredentials).toBe(true);
    meRequest.flush({
      user: {
        id: 'user-2',
        email: 'alice@example.com',
        name: 'Alice Smith',
        role: 'Manager',
        active: true,
      },
    });

    expect(service.currentUser()).toEqual({
      id: 'user-2',
      email: 'alice@example.com',
      name: 'Alice Smith',
      role: 'Manager',
      active: true,
    });
  });

  it('does not recheck the API session after an unauthenticated response', () => {
    let firstResult = true;
    let secondResult = true;

    service.ensureSession().subscribe((authenticated) => (firstResult = authenticated));

    http.expectOne('/api/auth/me').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    service.ensureSession().subscribe((authenticated) => (secondResult = authenticated));

    expect(firstResult).toBe(false);
    expect(secondResult).toBe(false);
  });

  it('adds PKCE parameters to the OIDC login redirect', async () => {
    const redirectUrl = await (service as unknown as AuthServiceInternals).oidcLoginUrl(
      '/dashboard',
    );
    const url = new URL(redirectUrl);
    const storedState = sessionStorage.getItem('opsboard.oidc.pkce');

    expect(url.pathname).toBe('/api/auth/oidc/login');
    expect(url.searchParams.get('returnUrl')).toBe(`${window.location.origin}/dashboard`);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url.searchParams.get('code_verifier')).toMatch(/^[A-Za-z0-9_-]{86}$/);
    expect(url.searchParams.get('nonce')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(storedState).not.toBeNull();

    const pkce = JSON.parse(storedState ?? '{}') as {
      readonly codeVerifier?: string;
      readonly returnUrl?: string;
      readonly state?: string;
    };
    expect(pkce.codeVerifier).toBe(url.searchParams.get('code_verifier'));
    expect(pkce.returnUrl).toBe(`${window.location.origin}/dashboard`);
    expect(pkce.state).toBe(url.searchParams.get('state'));
  });

  it('omits PKCE parameters when disabled by configuration', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_CONFIG,
          useValue: {
            ...config,
            oidc: { loginPath: '/auth/oidc/login', pkce: false },
          } satisfies AppConfig,
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    const disabledService = TestBed.inject(AuthService);
    const redirectUrl = await (disabledService as unknown as AuthServiceInternals).oidcLoginUrl(
      '/dashboard',
    );
    const url = new URL(redirectUrl);

    expect(url.searchParams.has('code_challenge')).toBe(false);
    expect(url.searchParams.has('code_verifier')).toBe(false);
    expect(sessionStorage.getItem('opsboard.oidc.pkce')).toBeNull();
  });

  it('uses the configured OIDC login base URL for browser redirects', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_CONFIG,
          useValue: {
            ...config,
            oidc: {
              ...config.oidc,
              loginBaseUrl: 'http://localhost:5000/api',
            },
          } satisfies AppConfig,
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    const directLoginService = TestBed.inject(AuthService);
    const redirectUrl = await (directLoginService as unknown as AuthServiceInternals).oidcLoginUrl(
      '/',
    );
    const url = new URL(redirectUrl);

    expect(url.origin).toBe('http://localhost:5000');
    expect(url.pathname).toBe('/api/auth/oidc/login');
    expect(url.searchParams.get('returnUrl')).toBe(`${window.location.origin}/`);
  });
});
