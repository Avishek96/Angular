import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { APP_CONFIG } from '../models/app-config.model';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { production: false, apiUrl: '/api' } },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function token(claims: Record<string, unknown>): string {
    const encoded = btoa(JSON.stringify(claims))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `header.${encoded}.signature`;
  }

  it('connects login to the configured API', () => {
    const response: AuthResponse = {
      accessToken: token({
        sub: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
        role: 'Administrator',
        exp: 4_102_444_800,
      }),
      expiresAt: '2026-06-15T12:00:00Z',
    };

    service.login({ email: 'alice@example.com', password: 'Password123!' }).subscribe();

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'alice@example.com',
      password: 'Password123!',
    });
    request.flush(response);

    expect(service.authenticated()).toBe(true);
    expect(service.currentUser()?.id).toBe('user-1');
    expect(service.currentUser()?.email).toBe('alice@example.com');
    expect(service.currentUser()?.name).toBe('Alice');
    expect(service.currentUser()?.role).toBe('Administrator');
  });

  it('connects registration to the configured API', () => {
    service.register({ email: 'alice@example.com', password: 'Password123!' }).subscribe();

    const request = http.expectOne('/api/auth/register');
    expect(request.request.method).toBe('POST');
    request.flush({
      accessToken: token({
        sub: 'user-1',
        email: 'alice@example.com',
        exp: 4_102_444_800,
      }),
      expiresAt: '2026-06-15T12:00:00Z',
    } satisfies AuthResponse);
  });

  it('reads ASP.NET Identity claims from the token', () => {
    service.login({ email: 'alice@example.com', password: 'Password123!' }).subscribe();

    http.expectOne('/api/auth/login').flush({
      accessToken: token({
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'user-2',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'alice@example.com',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Alice Smith',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Manager',
        exp: 4_102_444_800,
      }),
    } satisfies AuthResponse);

    expect(service.currentUser()).toEqual({
      id: 'user-2',
      email: 'alice@example.com',
      name: 'Alice Smith',
      role: 'Manager',
      active: true,
    });
  });
});
