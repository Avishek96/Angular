export interface AuthRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly accessToken: string;
  readonly expiresAt?: string;
}
