import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    title: 'Sign in | OpsBoard',
    data: { breadcrumb: 'Sign in' },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth').then((module) => module.Auth),
  },
  {
    path: '',
    title: 'Dashboard | OpsBoard',
    data: { breadcrumb: 'Dashboard' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((module) => module.Dashboard),
  },
  {
    path: 'products',
    title: 'Products | OpsBoard',
    data: { breadcrumb: 'Products' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/products').then((module) => module.Products),
  },
  {
    path: 'users',
    title: 'Users | OpsBoard',
    data: { breadcrumb: 'Users' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users').then((module) => module.Users),
  },
  {
    path: 'settings',
    title: 'Settings | OpsBoard',
    data: { breadcrumb: 'Settings' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings').then((module) => module.Settings),
  },
  {
    path: '**',
    title: 'Page not found | OpsBoard',
    data: { breadcrumb: 'Page not found' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/not-found/not-found').then((module) => module.NotFound),
  },
];
