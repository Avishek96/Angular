import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../core/interceptors/api-error.interceptor';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { ManagedUser } from '../user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-users',
  imports: [InitialsPipe, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly query = signal('');
  protected readonly users = signal<readonly ManagedUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly actionUserId = signal<string | null>(null);
  protected readonly resettingUser = signal<ManagedUser | null>(null);
  protected readonly newPassword = signal('');

  protected readonly filteredUsers = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.users().filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email} ${user.roles.join(' ')}`
        .toLowerCase()
        .includes(query),
    );
  });

  ngOnInit(): void {
    this.userService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: (error: ApiError) => this.error.set(error.message),
      });
  }

  protected fullName(user: ManagedUser): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  protected updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected toggleActive(user: ManagedUser): void {
    this.error.set('');
    this.actionUserId.set(user.id);
    this.userService
      .setActive(user.id, !user.active)
      .pipe(finalize(() => this.actionUserId.set(null)))
      .subscribe({
        next: () =>
          this.users.update((users) =>
            users.map((item) => (item.id === user.id ? { ...item, active: !item.active } : item)),
          ),
        error: (error: ApiError) => this.error.set(error.message),
      });
  }

  protected openResetPassword(user: ManagedUser): void {
    this.resettingUser.set(user);
    this.newPassword.set('');
    this.error.set('');
  }

  protected closeResetPassword(): void {
    this.resettingUser.set(null);
    this.newPassword.set('');
  }

  protected updateNewPassword(event: Event): void {
    this.newPassword.set((event.target as HTMLInputElement).value);
  }

  protected resetPassword(): void {
    const user = this.resettingUser();
    if (!user) {
      return;
    }

    this.actionUserId.set(user.id);
    this.error.set('');
    this.userService
      .resetPassword(user.id, { newPassword: this.newPassword() })
      .pipe(finalize(() => this.actionUserId.set(null)))
      .subscribe({
        next: () => this.closeResetPassword(),
        error: (error: ApiError) => this.error.set(error.message),
      });
  }
}
