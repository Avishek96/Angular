import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiError {
  readonly message: string;
  readonly status: number;
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      const apiError: ApiError =
        error instanceof HttpErrorResponse
          ? {
              message:
                error.error?.message ??
                (error.status === 0
                  ? 'The API server is unavailable.'
                  : 'The request could not be completed.'),
              status: error.status,
            }
          : { message: 'An unexpected error occurred.', status: 0 };

      return throwError(() => apiError);
    }),
  );
