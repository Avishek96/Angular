import { API_LIST } from '../app/core/models/api-list.model';

export const environment = {
  production: true,
  apiUrl: '/api',
  oidc: {
    loginPath: API_LIST.auth.oidcLogin,
    pkce: true,
  },
} as const;
