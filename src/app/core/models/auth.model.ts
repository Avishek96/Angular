import { User } from './user.model';

export interface AuthRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegistrationRequest extends AuthRequest {
  readonly firstName: string;
  readonly lastName: string;
}

export interface AuthResponse {
  readonly user?: User;
}
