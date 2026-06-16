import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../models/app-config.model';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(APP_CONFIG);
  const isApiRequest = request.url.startsWith(config.apiUrl);

  if (!isApiRequest) {
    return next(request);
  }

  return next(request.clone({ withCredentials: true }));
};
