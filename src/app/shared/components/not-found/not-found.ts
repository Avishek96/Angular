import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section>
      <p>404</p>
      <h1>That page does not exist.</h1>
      <a routerLink="/">Return to dashboard</a>
    </section>
  `,
  styles: `
    section {
      max-width: 42rem;
      padding: 8vh 0;
    }
    p {
      color: var(--color-primary);
      font-weight: 800;
    }
    h1 {
      margin: 1rem 0 2rem;
      font-size: clamp(3rem, 9vw, 6rem);
      line-height: 0.95;
      letter-spacing: -0.075em;
    }
    a {
      color: var(--color-primary);
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
