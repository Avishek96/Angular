import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  protected login(): void {
    this.auth.login();
    void this.router.navigateByUrl('/');
  }
}
