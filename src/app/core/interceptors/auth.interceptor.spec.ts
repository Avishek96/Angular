import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../models/app-config.model';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('sends credentials with configured API requests', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { production: false, apiUrl: '/api' } },
      ],
    });

    TestBed.inject(HttpClient).get('/api/users').subscribe();

    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/users');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
    http.verify();
  });
});
