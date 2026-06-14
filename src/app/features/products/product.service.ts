import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../../core/models/app-config.model';
import { Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getAll() {
    return this.http.get<readonly Product[]>(`${this.config.apiUrl}/products`);
  }
}
