import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    title: 'Users | OpsBoard',
    data: { breadcrumb: 'Users' },
    canActivate: [authGuard],
    loadComponent: () => import('./user-list/users.component').then((module) => module.Users),
  },
  {
    path: ':id/edit',
    title: 'Update user | OpsBoard',
    data: { breadcrumb: 'Update user' },
    canActivate: [authGuard],
    loadComponent: () => import('./user-edit/user-edit.component').then((module) => module.UserEdit),
  },
];
