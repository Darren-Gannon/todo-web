import { NotificationType } from "./notification-type.enum";

export interface Notification {
    id: string;
    title: string;
    userId: string;
    read: boolean;
    type: NotificationType;
    data: object;
    createdAt: string;
    updatedAt: string;
}