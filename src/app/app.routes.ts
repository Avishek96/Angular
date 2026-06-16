import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((module) => module.authRoutes),
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((module) => module.dashboardRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then((module) => module.productsRoutes),
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then((module) => module.usersRoutes),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.routes').then((module) => module.settingsRoutes),
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
