import { Component } from '@angular/core';
import { UserInviteService } from 'src/api/board/user-invite/user-invite.service';

@Component({
  selector: 'app-user-invite-list-page',
  templateUrl: './user-invite-list-page.component.html',
  styleUrls: ['./user-invite-list-page.component.scss']
})
export class UserInviteListPageComponent {

  public readonly userInvites$ = this.userInviteService.findAllForUser();

  constructor(
    private readonly userInviteService: UserInviteService,
  ) { }
}
