import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../core/models/app-config.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { production: false, apiUrl: '/api' } },
      ],
    });

    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads users from the configured API', () => {
    let users;
    service.getAll().subscribe((response) => (users = response));

    const request = http.expectOne('/api/users');
    expect(request.request.method).toBe('GET');
    request.flush({
      users: [
        {
          id: 'user-1',
          name: 'Morgan Lee',
          email: 'morgan@example.com',
          isActive: true,
          role: 'admin',
        },
      ],
    });

    expect(users).toEqual([
      {
        id: 'user-1',
        firstName: 'Morgan',
        lastName: 'Lee',
        email: 'morgan@example.com',
        active: true,
        roles: ['admin'],
        createdAt: undefined,
      },
    ]);
  });

  it('loads a wrapped user by id', () => {
    let user;
    service.getById('user-1').subscribe((response) => (user = response));

    const request = http.expectOne('/api/users/user-1');
    expect(request.request.method).toBe('GET');
    request.flush({
      user: {
        id: 'user-1',
        firstName: 'Morgan',
        lastName: 'Lee',
        email: 'morgan@example.com',
        active: true,
        roles: ['admin'],
      },
    });

    expect(user).toEqual({
      id: 'user-1',
      firstName: 'Morgan',
      lastName: 'Lee',
      email: 'morgan@example.com',
      active: true,
      roles: ['admin'],
      createdAt: undefined,
    });
  });

  it('updates status and resets passwords', () => {
    service.setActive('user-1', false).subscribe();
    service.resetPassword('user-1', { newPassword: 'NewPassword123!' }).subscribe();

    const statusRequest = http.expectOne('/api/users/user-1/status');
    expect(statusRequest.request.method).toBe('PUT');
    expect(statusRequest.request.body).toEqual({ active: false });
    statusRequest.flush(null);

    const passwordRequest = http.expectOne('/api/users/user-1/reset-password');
    expect(passwordRequest.request.method).toBe('POST');
    expect(passwordRequest.request.body).toEqual({ newPassword: 'NewPassword123!' });
    passwordRequest.flush(null);
  });
});
