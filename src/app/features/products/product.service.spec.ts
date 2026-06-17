import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../core/models/app-config.model';
import { ProductService } from './product.service';

const config = {
  production: false,
  apiUrl: '/api',
  oidc: {
    loginPath: '/auth/oidc/login',
  },
};

describe('ProductService', () => {
  it('connects products to the configured API', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: config },
      ],
    });

    TestBed.inject(ProductService).getAll().subscribe();

    const request = TestBed.inject(HttpTestingController).expectOne('/api/products');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    TestBed.inject(HttpTestingController).verify();
  });
});
