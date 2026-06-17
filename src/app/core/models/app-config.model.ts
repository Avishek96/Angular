import { InjectionToken } from '@angular/core';

export interface AppConfig {
  readonly apiUrl: string;
  readonly oidc: {
    readonly loginPath: string;
  };
  readonly production: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
