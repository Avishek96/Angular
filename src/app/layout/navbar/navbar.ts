import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-navbar',
  imports: [DatePipe, InitialsPipe, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  readonly sidebarOpen = input(false);
  readonly sidebarCollapsed = input(false);
  readonly toggleSidebar = output<void>();
  readonly toggleSidebarPanel = output<void>();

  protected readonly auth = inject(AuthService);
  protected readonly currentTime = signal<Date | null>(null);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    afterNextRender(() => {
      this.currentTime.set(new Date());
      const timer = window.setInterval(() => this.currentTime.set(new Date()), 1000);
      this.destroyRef.onDestroy(() => window.clearInterval(timer));
    }, { injector: this.injector });
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/auth');
  }
}
