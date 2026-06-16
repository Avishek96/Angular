# Production Angular Application

An Angular 21 standalone application demonstrating a production-oriented baseline:

- Standalone components, strict TypeScript, signals, and `OnPush` change detection
- Bootstrap 5 responsive sidebar with Angular-managed mobile behavior
- Tailwind CSS utilities configured alongside Bootstrap
- Feature-first structure with lazy-loaded routes
- SSR, hydration, event replay, and prerendering
- Central application configuration and functional HTTP interceptor
- Accessible, responsive UI built with Bootstrap
- Unit tests, formatting checks, bundle budgets, CI, health check, and Docker packaging

## 1. Prerequisites

- Node.js 24
- npm 11
- Docker, only when building the container

## 2. Install and run

```bash
npm ci
npm start
```

Open `http://localhost:4200`.

## 3. Project structure

```text
src/app/
  core/       Guards, interceptors, services, and application models
  features/   Lazy-loaded business features
  layout/     Navbar, sidebar, and footer shell components
  shared/     Reusable components, directives, pipes, and utilities
src/environments/
src/assets/
```

Keep business code inside its feature. Move code into `shared` only after it is reused, and reserve
`core` for application-wide infrastructure.

## 4. Connect an API

The typed `APP_CONFIG` token lives in `src/app/core/models/app-config.model.ts`. Environment files
provide its values, including the default `/api` base path. Add domain-specific API services inside
their owning feature and inject `APP_CONFIG` rather than scattering URLs through components.

The Angular app expects the following API endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `PUT /api/users/{id}/status`
- `POST /api/users/{id}/reset-password`

Authentication responses must contain an `accessToken` JWT. The token must include user ID (`sub`),
`email`, and expiry (`exp`) claims; `name`, `role`, and `active` claims are optional. ASP.NET
Identity claim URIs are also supported. The auth interceptor automatically adds the bearer token to
API requests. Configure or proxy `/api` to your external backend in each deployment environment.

During `npm start`, [`proxy.conf.json`](proxy.conf.json) forwards `/api` requests to
`http://localhost:5000`. Change its `target` to the address of your API when needed. The production
server deliberately returns a JSON `502` response for unconfigured `/api` routes instead of
returning the Angular HTML page.

## 5. Validate every change

```bash
npm run validate
```

This checks formatting, runs unit tests once, and creates an optimized production SSR build. Angular
bundle budgets in `angular.json` fail the build if the application grows unexpectedly.

## 6. Run the production server

```bash
npm run build
npm run serve:ssr:production-app
```

The server listens on `PORT` or `4000` and exposes `GET /api/health` for orchestration probes.

## 7. Build and run the container

```bash
docker build -t production-angular .
docker run --rm -p 4000:4000 production-angular
```

## 8. Production checklist

1. Replace example dashboard data with feature-owned API services.
2. Provide environment-specific secrets through the backend or deployment platform, never in the
   browser bundle.
3. Add authentication and authorization guards around protected routes.
4. Connect error reporting, performance monitoring, and structured server logs.
5. Add end-to-end tests for critical journeys.
6. Review accessibility, bundle output, CSP, caching, and dependency updates before each release.

GitHub Actions runs `npm run validate` for pushes to `main` and pull requests.
