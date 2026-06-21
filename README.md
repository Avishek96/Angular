# Production Angular Application

Production-ready Angular 21 application built with standalone components, lazy feature routes, SSR,
typed services, reusable UI utilities, Docker packaging, and optional Nginx reverse proxy support.

## Technology Stack

- Angular 21 with standalone components and strict TypeScript
- Angular Router with feature-level lazy loading
- Angular SSR using `@angular/ssr` and Express
- RxJS for async streams and HTTP flows
- Bootstrap 5 for base responsive UI components
- Tailwind CSS 4 through PostCSS for utility styling
- SCSS for component styles
- npm 11 and Node.js 24
- Angular unit test builder with Vitest dependencies
- Docker multi-stage image for production runtime
- Nginx config for static hosting and API proxy scenarios
- GitHub Actions validation on `main` pushes and pull requests

## Architecture

```text
src/
  app/
    core/
      guards/          Route protection and app-level access rules
      interceptors/    HTTP auth and API error handling
      models/          Shared typed contracts and configuration models
      services/        Application-wide services such as auth and dynamic forms
    features/
      auth/            Login/register feature
      dashboard/       Dashboard and overview feature
      products/        Product feature and feature-owned API service
      settings/        Settings feature
      users/           User list, user edit, and user-owned API service
    layout/            Navbar, sidebar, breadcrumb, footer, and shell UI
    shared/
      components/      Reusable UI components such as dynamic form and not-found
      directives/      Shared directives
      pipes/           Shared pipes
      utils/           Small framework-agnostic helpers
  assets/              Static Angular assets
  environments/        Development and production environment config
  server.ts            Express SSR server and API health endpoint
public/                Public static files copied by Angular
Dockerfile             Production Docker build
nginx.conf             Optional Nginx static host/API proxy config
proxy.conf.json        Local dev API proxy config
```

### Module Boundaries

- Put business behavior inside the owning `features/*` folder.
- Keep `core` for singleton services, guards, interceptors, and app-wide contracts.
- Move code to `shared` only after it is reused by multiple features.
- Keep feature services close to the feature API they represent.
- Keep components presentation-focused; put API calls and state orchestration in services where the
  behavior is shared or complex.

## Design Patterns

- **Feature-first architecture:** each feature owns its routes, components, services, and models.
- **Lazy loading:** routes use `loadChildren` and feature route files to reduce initial bundle size.
- **Standalone Angular:** components are imported directly without NgModules.
- **Dependency injection:** configuration and services are injected rather than imported globally.
- **HTTP interceptor pipeline:** auth token attachment and API error handling are centralized.
- **Guarded navigation:** route guards protect authenticated areas.
- **Typed contracts:** API, auth, user, dynamic form, and app config data use TypeScript models.
- **Reusable dynamic forms:** shared dynamic form components and models keep form rendering
  consistent.
- **SSR boundary:** Express handles health checks, unconfigured `/api` responses, static files, and
  Angular rendering.

## Prerequisites

- Node.js 24
- npm 11
- Docker Desktop, only for container builds
- Git, only when committing or pushing changes

Check versions:

```bash
node --version
npm --version
git --version
```

## Local Development

Install dependencies:

```bash
npm ci
```

Run the Angular dev server:

```bash
npm start
```

Open:

```text
http://localhost:4200
```

During local development, `proxy.conf.json` forwards `/api` requests to:

```text
http://localhost:5000
```

Change the proxy target if your backend runs on a different host or port.

## API Contract

The app expects these backend endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `PUT /api/users/{id}/status`
- `POST /api/users/{id}/reset-password`

Authentication responses must include an `accessToken` JWT. The token should include `sub`, `email`,
and `exp` claims. `name`, `role`, and `active` are optional. ASP.NET Identity claim URI formats are
also supported.

## Environment Configuration

Application configuration is modeled in:

```text
src/app/core/models/app-config.model.ts
```

Environment values live in:

```text
src/environments/environment.ts
src/environments/environment.production.ts
```

Use environment files for public browser configuration only. Keep secrets in the backend or
deployment platform.

## Common Commands

```bash
npm start
```

Runs the development server on `http://localhost:4200`.

```bash
npm run build:dev
```

Creates a development build.

```bash
npm run build
```

Creates a production SSR build in `dist/production-app`.

```bash
npm test
```

Runs unit tests once.

```bash
npm run test:watch
```

Runs unit tests in watch mode.

```bash
npm run format
```

Formats the project with Prettier.

```bash
npm run format:check
```

Checks formatting without changing files.

```bash
npm run validate
```

Runs formatting checks, unit tests, and the production build.

## Run SSR Production Server

Build the app:

```bash
npm run build
```

Start the Express SSR server:

```bash
npm run serve:ssr:production-app
```

Default URL:

```text
http://localhost:4000
```

Health check:

```text
GET http://localhost:4000/api/health
```

Set a custom port:

```bash
$env:PORT=8080
npm run serve:ssr:production-app
```

## Docker Instructions

Build the image:

```bash
docker build -t production-angular .
```

Run the container:

```bash
docker run --rm -p 4000:4000 production-angular
```

Open:

```text
http://localhost:4000
```

The Dockerfile uses a multi-stage build:

- `build` installs dependencies and creates the Angular production build.
- `runtime` installs production dependencies only and starts the SSR server.

## Nginx Instructions

The root `nginx.conf` is useful when hosting static Angular browser output behind Nginx and proxying
API calls.

It listens on port `80`, serves `/usr/share/nginx/html`, falls back to `index.html` for Angular
routes, and proxies:

```text
/api/ -> http://host.docker.internal:5000/api/
```

Use the SSR Dockerfile when you need server-side rendering. Use Nginx static hosting only when the
deployment target is intended to serve the browser build as static files.

## Git Workflow

Check local changes:

```bash
git status
```

Create a commit:

```bash
git add README.md
git commit -m "docs: update project architecture and run instructions"
```

Push to GitHub:

```bash
git push origin main
```

## Production Checklist

1. Connect all feature services to the real backend API.
2. Keep browser environment files free of secrets.
3. Verify auth guards and authorization rules for protected routes.
4. Configure API base URLs per deployment environment.
5. Add end-to-end tests for critical user journeys.
6. Review accessibility, bundle budgets, caching, CSP, and dependency updates before release.
7. Run `npm run validate` before opening a pull request or deploying.
