import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    title: 'Sign in | OpsBoard',
    data: { breadcrumb: 'Sign in' },
    canActivate: [guestGuard],
    loadComponent: () => import('./auth').then((module) => module.Auth),
  },
];
