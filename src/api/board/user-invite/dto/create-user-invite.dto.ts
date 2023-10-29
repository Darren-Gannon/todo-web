import { UserRole } from "../../board-user";

export interface CreateUserInviteDto {
    email: string;
    role: UserRole;
}
