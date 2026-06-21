import { InjectionToken } from '@angular/core';

export interface AppConfig {
  readonly apiUrl: string;
  readonly oidc: {
    readonly loginBaseUrl?: string;
    readonly loginPath: string;
    readonly pkce?: boolean;
  };
  readonly production: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
