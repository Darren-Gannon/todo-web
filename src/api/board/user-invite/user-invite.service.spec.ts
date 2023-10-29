import { TestBed } from '@angular/core/testing';

import { UserInviteService } from './user-invite.service';

describe('UserInviteService', () => {
  let service: UserInviteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserInviteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
