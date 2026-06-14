import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly authenticated = signal(false);
  readonly currentUser = signal<User | null>(null);

  login(): void {
    this.authenticated.set(true);
    this.currentUser.set({
      id: 1,
      name: 'Avery Stone',
      email: 'avery@example.com',
      role: 'Administrator',
      active: true,
    });
  }

  logout(): void {
    this.authenticated.set(false);
    this.currentUser.set(null);
  }
}
