import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { APP_CONFIG } from './core/models/app-config.model';
import { AuthService } from './core/services/auth.service';
import { App } from './app';

describe('App', () => {
  const authenticated = signal(false);
  const currentUser = signal<{
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  } | null>(null);

  beforeEach(async () => {
    authenticated.set(false);
    currentUser.set(null);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: APP_CONFIG, useValue: environment },
        {
          provide: AuthService,
          useValue: {
            authenticated,
            currentUser,
            logout: () => {
              authenticated.set(false);
              currentUser.set(null);
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should hide the application shell before login', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar-navigation')).toBeNull();
    expect(compiled.querySelector('.app-header')).toBeNull();
  });

  it('should render the application shell after login', async () => {
    const fixture = TestBed.createComponent(App);
    authenticated.set(true);
    currentUser.set({
      id: 'test-user',
      name: 'Avery Stone',
      email: 'avery@example.com',
      role: 'Administrator',
      active: true,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar-navigation')?.textContent).toContain('Dashboard');
    expect(compiled.querySelector('.sidebar-navigation')?.textContent).toContain('Orders');
    expect(compiled.querySelector('.brand-button')?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('.navigation-toggle')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(compiled.querySelector('.app-header')?.textContent).toContain('Avery Stone');
    expect(compiled.querySelector('.logout-button')?.textContent).toContain('Logout');
    expect(compiled.querySelector('[aria-label="Breadcrumb"]')?.textContent).toContain('Home');
  });
});
