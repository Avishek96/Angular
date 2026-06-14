import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiError } from '../../core/interceptors/api-error.interceptor';
import { Product } from './product.model';
import { ProductService } from './product.service';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  protected readonly products = signal<readonly Product[]>([]);
  protected readonly error = signal('');
  protected readonly loading = signal(true);

  constructor() {
    inject(ProductService)
      .getAll()
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: (error: ApiError) => {
          this.error.set(error.message);
          this.loading.set(false);
        },
      });
  }
}
