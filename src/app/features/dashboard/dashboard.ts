import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Metric {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly positive: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly metrics: readonly Metric[] = [
    { label: 'Availability', value: '99.99%', trend: '+0.04%', positive: true },
    { label: 'Deployments', value: '24', trend: '+18%', positive: true },
    { label: 'Open incidents', value: '2', trend: '-3', positive: true },
    { label: 'P95 response', value: '184 ms', trend: '+12 ms', positive: false },
  ];
}
