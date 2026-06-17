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
  },
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
});
