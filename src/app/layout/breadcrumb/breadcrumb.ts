import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb {
  protected readonly currentLabel = signal('Dashboard');

  constructor() {
    const router = inject(Router);
    const activatedRoute = inject(ActivatedRoute);

    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        let route = activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }

        this.currentLabel.set(route.snapshot.data['breadcrumb'] ?? 'Dashboard');
      });
  }
}
