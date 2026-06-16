import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type Submenu = 'dashboard';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly open = input(false);
  readonly collapsed = input(false);
  readonly closeSidebar = output<void>();
  readonly togglePanel = output<void>();

  protected readonly openSubmenu = signal<Submenu | null>('dashboard');

  protected toggleSubmenu(submenu: Submenu): void {
    if (this.collapsed()) {
      this.togglePanel.emit();
      this.openSubmenu.set(submenu);
      return;
    }

    this.openSubmenu.update((current) => (current === submenu ? null : submenu));
  }
}
