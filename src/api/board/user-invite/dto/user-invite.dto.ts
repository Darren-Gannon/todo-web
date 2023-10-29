import { UserRole } from "../../board-user";

export interface UserInvite {
    id: string;
    email: string;
    boardTitle: string;
    boardId: string;
    role: UserRole;
    createdAt: Date;
}