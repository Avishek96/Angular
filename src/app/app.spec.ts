import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
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
    TestBed.inject(AuthService).login();
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
