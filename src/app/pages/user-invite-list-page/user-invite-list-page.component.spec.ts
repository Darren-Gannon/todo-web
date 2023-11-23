import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInviteListPageComponent } from './user-invite-list-page.component';

describe('UserInviteListPageComponent', () => {
  let component: UserInviteListPageComponent;
  let fixture: ComponentFixture<UserInviteListPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserInviteListPageComponent]
    });
    fixture = TestBed.createComponent(UserInviteListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
