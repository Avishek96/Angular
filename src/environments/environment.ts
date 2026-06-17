export const environment = {
  production: false,
  apiUrl: '/api',
  oidc: {
    loginPath: '/auth/oidc/login',
  },
} as const;
