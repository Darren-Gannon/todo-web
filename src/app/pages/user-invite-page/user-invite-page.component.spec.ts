import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInvitePageComponent } from './user-invite-page.component';

describe('UserInvitePageComponent', () => {
  let component: UserInvitePageComponent;
  let fixture: ComponentFixture<UserInvitePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserInvitePageComponent]
    });
    fixture = TestBed.createComponent(UserInvitePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
