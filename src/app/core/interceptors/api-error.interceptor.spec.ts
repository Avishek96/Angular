import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiErrorInterceptor, ApiError } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  it('explains forbidden API responses', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    let receivedError: ApiError | undefined;
    TestBed.inject(HttpClient)
      .get('/api/users')
      .subscribe({
        error: (error: ApiError) => (receivedError = error),
      });

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/users').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(receivedError).toEqual({
      message: 'You do not have permission to perform this action.',
      status: 403,
    });
    http.verify();
  });
});
