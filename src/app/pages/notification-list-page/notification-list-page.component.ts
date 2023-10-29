import { Component } from '@angular/core';
import { Notification, NotificationService, NotificationState } from '../../../api/notification';
import { NotificationType } from '../../../api/notification/dto/notification-type.enum';
import { Subject, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-notification-list-page',
  templateUrl: './notification-list-page.component.html',
  styleUrls: ['./notification-list-page.component.scss']
})
export class NotificationListPageComponent {

  public readonly Object = Object;

  public readonly notifications$ = this.notificationService.findAll();

  public readonly readNotificationEmitter = new Subject<Notification>();
  public readonly readNotification$ = this.readNotificationEmitter.asObservable().pipe(
    switchMap(notification => this.notificationService.markAsRead(notification.id)),
  );

  constructor(
    private readonly notificationService: NotificationService,
  ) { }

  sortNotifications(notifications: NotificationState[]): NotificationState[] {
    return notifications.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
  }

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
