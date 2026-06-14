import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Users } from './users';

describe('Users', () => {
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Users] }).compileComponents();
    fixture = TestBed.createComponent(Users);
    fixture.detectChanges();
  });

  it('renders all users initially', () => {
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(4);
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
