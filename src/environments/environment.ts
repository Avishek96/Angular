import { API_LIST } from '../app/core/models/api-list.model';

export const environment = {
  production: false,
  apiUrl: '/api',
  oidc: {
    loginBaseUrl: 'http://localhost:5000/api',
    loginPath: API_LIST.auth.oidcLogin,
    pkce: true,
  },
} as const;
