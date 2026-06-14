export interface AuthRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly user: {
    readonly id: string;
    readonly email: string;
  };
}
