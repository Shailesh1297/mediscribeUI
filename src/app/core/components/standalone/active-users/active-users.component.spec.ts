import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveUsersComponent } from './active-users.component';

describe('ActiveUsersComponent', () => {
  let component: ActiveUsersComponent;
  let fixture: ComponentFixture<ActiveUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActiveUsersComponent]
    });
    fixture = TestBed.createComponent(ActiveUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
