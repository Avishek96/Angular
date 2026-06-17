import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products',
    renderMode: RenderMode.Client,
  },
  {
    path: 'users',
    renderMode: RenderMode.Client,
  },
  {
    path: 'users/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'settings',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
