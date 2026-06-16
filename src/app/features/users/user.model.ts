export interface ManagedUser {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly active: boolean;
  readonly roles: readonly string[];
  readonly createdAt?: string;
}

export interface UpdateUserRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly active: boolean;
}

export interface ResetPasswordRequest {
  readonly newPassword: string;
}
