import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../models/app-config.model';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('adds the bearer token to configured API requests', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { production: false, apiUrl: '/api' } },
        { provide: AuthService, useValue: { token: () => 'access-token' } },
      ],
    });

    TestBed.inject(HttpClient).get('/api/users').subscribe();

    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/users');
    expect(request.request.headers.get('Authorization')).toBe('Bearer access-token');
    request.flush([]);
    http.verify();
  });
});
