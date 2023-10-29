import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { map, share, switchMap, timer } from 'rxjs';
import { BoardService } from '../../../api';
import { Notification, NotificationService, NotificationState } from '../../../api/notification';
import { NotificationType } from '../../../api/notification/dto/notification-type.enum';

@Component({
  selector: 'app-app-page',
  templateUrl: './app-page.component.html',
  styleUrls: ['./app-page.component.scss']
})
export class AppPageComponent {

  public readonly Object = Object;

  public readonly boards$ = this.boardService.find();
  public readonly notifications$ = timer(1000 * 10).pipe(
    switchMap(() => this.notificationService.findAll()),
    share(),
  );
  public readonly unreadNotifications$ = this.notifications$.pipe(
    map(notifications => Object.values(notifications.data).reduce((acc, notification) => !notification.data.read ? ++acc : acc, 0)),
  );

  sortNotifications(notifications: NotificationState[]): NotificationState[] {
    return notifications.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
  }

  constructor(
    public readonly authService: AuthService,
    public readonly boardService: BoardService,
    public readonly notificationService: NotificationService,
  ) { }

  public getNotificationLink(notification: Notification): string {
    const notificationData = JSON.parse(notification.data);
    switch (notification.type) {
      case NotificationType.CREATE_BOARD: 
        return `/app/board/${ notificationData.board.id }`;
      case NotificationType.INVITE_USER:
        return `/app/invite/${ notificationData.invite.id }`;
      default: 
        throw new Error(`Invalid notification type: '${ notification.type }'`)
    }
  }
}
