import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../../core/models/app-config.model';
import { Users } from './users.component';

describe('Users', () => {
  let fixture: ComponentFixture<Users>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { production: false, apiUrl: '/api' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Users);
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/users').flush([
      {
        id: 'user-1',
        firstName: 'Morgan',
        lastName: 'Lee',
        email: 'morgan@example.com',
        active: true,
        roles: ['Admin'],
      },
      {
        id: 'user-2',
        firstName: 'Jordan',
        lastName: 'Davis',
        email: 'jordan@example.com',
        active: false,
        roles: ['User'],
      },
    ]);
    fixture.detectChanges();
  });

  it('renders all users initially', () => {
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('filters users from the search field', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'morgan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('tbody')?.textContent).toContain('Morgan Lee');
  });
});
