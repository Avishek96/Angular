export const environment = {
  production: true,
  apiUrl: '/api',
  oidc: {
    loginPath: '/auth/oidc/login',
  },
} as const;
