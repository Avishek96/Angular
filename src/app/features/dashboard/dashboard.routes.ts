import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    title: 'Dashboard | OpsBoard',
    data: { breadcrumb: 'Dashboard' },
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard').then((module) => module.Dashboard),
  },
];
