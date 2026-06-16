import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    title: 'Settings | OpsBoard',
    data: { breadcrumb: 'Settings' },
    canActivate: [authGuard],
    loadComponent: () => import('./settings').then((module) => module.Settings),
  },
];
