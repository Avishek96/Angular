import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const productsRoutes: Routes = [
  {
    path: '',
    title: 'Products | OpsBoard',
    data: { breadcrumb: 'Products' },
    canActivate: [authGuard],
    loadComponent: () => import('./products').then((module) => module.Products),
  },
];
