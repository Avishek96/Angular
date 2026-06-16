import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiError {
  readonly message: string;
  readonly status: number;
}

function messageFromHttpError(error: HttpErrorResponse): string {
  const apiMessage = error.error?.message ?? error.error?.detail ?? error.error?.title;
  if (typeof apiMessage === 'string' && apiMessage.length > 0) {
    return apiMessage;
  }

  if (error.status === 0) {
    return 'The API server is unavailable.';
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  return 'The request could not be completed.';
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      const apiError: ApiError =
        error instanceof HttpErrorResponse
          ? {
              message: messageFromHttpError(error),
              status: error.status,
            }
          : { message: 'An unexpected error occurred.', status: 0 };

      return throwError(() => apiError);
    }),
  );
