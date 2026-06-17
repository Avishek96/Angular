import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error) {
      this.error.set(this.errorMessage(error));
      return;
    }

    this.signIn();
  }

  protected signIn(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      this.auth.login(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/');
    } catch {
      this.error.set('The sign-in request could not be started.');
      this.loading.set(false);
    }
  }

  private errorMessage(error: string): string {
    switch (error) {
      case 'oidc_not_enabled':
        return 'OpenID Connect is not enabled on the Identity API.';
      case 'oidc_failed':
        return 'OpenID Connect sign-in failed. Please try again.';
      default:
        return 'The sign-in request could not be completed.';
    }
  }
}
