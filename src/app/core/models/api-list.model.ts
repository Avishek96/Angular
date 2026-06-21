export const API_LIST = {
  auth: {
    me: '/auth/me',
    logout: '/auth/logout',
    oidcLogin: '/auth/oidc/login',
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${encodeURIComponent(id)}`,
    status: (id: string) => `/users/${encodeURIComponent(id)}/status`,
    resetPassword: (id: string) => `/users/${encodeURIComponent(id)}/reset-password`,
  },
} as const;

export function apiUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
}
