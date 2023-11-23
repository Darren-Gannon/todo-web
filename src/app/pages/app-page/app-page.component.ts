import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { interval, map, share, startWith, switchMap, timer } from 'rxjs';
import { BoardService } from '../../../api';
import { Notification, NotificationService, NotificationState } from '../../../api/notification';
import { NotificationType } from '../../../api/notification/dto/notification-type.enum';
import { UserInviteService } from 'src/api/board/user-invite/user-invite.service';

@Component({
  selector: 'app-app-page',
  templateUrl: './app-page.component.html',
  styleUrls: ['./app-page.component.scss']
})
export class AppPageComponent {

  public readonly Object = Object;

  public readonly boards$ = this.boardService.find();
  public readonly notifications$ = interval(1000 * 60 * 10).pipe(
    startWith(0),
    switchMap(() => this.notificationService.findAll()),
    share(),
  );
  public readonly unreadNotifications$ = this.notifications$.pipe(
    map(notifications => Object.values(notifications.data).reduce((acc, notification) => !notification.data.read ? ++acc : acc, 0)),
  );

  public readonly userInvites$ = this.userInviteService.findAllForUser();

  sortNotifications(notifications: NotificationState[]): NotificationState[] {
    return notifications.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
  }

  constructor(
    private readonly authService: AuthService,
    private readonly boardService: BoardService,
    private readonly notificationService: NotificationService,
    private readonly userInviteService: UserInviteService,
  ) { }

  public markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  public getNotificationLink(notification: Notification): string {
    const notificationData: any = notification.data;
    switch (notification.type) {
      case NotificationType.CREATE_BOARD: 
        return `/app/board/${ notificationData.board.id }`;
      case NotificationType.INVITE_USER:
        return `/app/invite/${ notificationData.invite.id }`;
      default: 
        throw new Error(`Invalid notification type: '${ notification.type }'`)
    }
  }

  logout() {
    this.authService.logout();
  }
}
