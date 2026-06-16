import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { APP_CONFIG } from '../models/app-config.model';
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

  it('connects login to the configured API', () => {
    service.login({ email: 'alice@example.com', password: 'Password123!' }).subscribe();

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      email: 'alice@example.com',
      password: 'Password123!',
    });
    request.flush({
      user: {
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
        role: 'Administrator',
        active: true,
      },
    });

    expect(service.authenticated()).toBe(true);
    expect(service.currentUser()?.id).toBe('user-1');
    expect(service.currentUser()?.email).toBe('alice@example.com');
    expect(service.currentUser()?.name).toBe('Alice');
    expect(service.currentUser()?.role).toBe('Administrator');
  });

  it('connects registration to the configured API', () => {
    service
      .register({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      })
      .subscribe();

    const request = http.expectOne('/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'Password123!',
    });
    request.flush({
      user: {
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice Smith',
        role: 'User',
        active: true,
      },
    });
  });

  it('loads the authenticated user when the login response only sets a cookie', () => {
    service.login({ email: 'alice@example.com', password: 'Password123!' }).subscribe();

    http.expectOne('/api/auth/login').flush({});
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
});
