import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../core/interceptors/api-error.interceptor';
import { AuthService } from '../../core/services/auth.service';
import { AutofocusDirective } from '../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-auth',
  imports: [AutofocusDirective],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('alice@example.com');
  protected readonly password = signal('Password123!');
  protected readonly registering = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    this.loading.set(true);
    this.error.set('');
    const credentials = { email: this.email(), password: this.password() };
    const operation = this.registering()
      ? this.auth.register({
          firstName: this.firstName(),
          lastName: this.lastName(),
          ...credentials,
        })
      : this.auth.login(credentials);

    operation.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => void this.router.navigateByUrl('/products'),
      error: (error: ApiError) => this.error.set(error.message),
    });
  }

  protected updateFirstName(event: Event): void {
    this.firstName.set((event.target as HTMLInputElement).value);
  }

  protected updateLastName(event: Event): void {
    this.lastName.set((event.target as HTMLInputElement).value);
  }

  protected updateEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected updatePassword(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }
}
