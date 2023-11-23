import { Component } from '@angular/core';
import { UserInviteService } from '../../../api/board/user-invite/user-invite.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { UserInvite } from '../../../api/board/user-invite/dto/user-invite.dto';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-user-invite-page',
  templateUrl: './user-invite-page.component.html',
  styleUrls: ['./user-invite-page.component.scss']
})
export class UserInvitePageComponent {

  public readonly inviteId$ = this.route.paramMap.pipe(
    map(params => params.get('invite_id')!)
  );
  
  public readonly invite$ = this.inviteId$.pipe(
    switchMap(id => this.userInviteService.findOneForUser(id))
  );
  
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userInviteService: UserInviteService,
    private readonly auth: AuthService,
  ) { }

  acceptInvite(invite: UserInvite) {
    this.userInviteService.approveForUser(invite.id).pipe(
      switchMap(() => this.auth.loginWithRedirect({ 
        appState: { 
          target: `/app/board/${ invite.boardId }` 
        } 
      }))
    ).subscribe()
  }

  declineInvite(inviteId: string) {
    this.userInviteService.removeForUser(inviteId).pipe(
      switchMap(() => this.router.navigate(['/app']))
    ).subscribe()
  }
}
