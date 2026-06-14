import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { User } from '../../core/models/user.model';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-users',
  imports: [InitialsPipe],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  protected readonly query = signal('');
  protected readonly users: readonly User[] = [
    { id: 1, name: 'Avery Stone', email: 'avery@example.com', role: 'Admin', active: true },
    { id: 2, name: 'Morgan Lee', email: 'morgan@example.com', role: 'Editor', active: true },
    { id: 3, name: 'Jordan Davis', email: 'jordan@example.com', role: 'Viewer', active: false },
    { id: 4, name: 'Riley Chen', email: 'riley@example.com', role: 'Editor', active: true },
  ];

  protected readonly filteredUsers = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.users.filter((user) =>
      `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query),
    );
  });

  protected updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
