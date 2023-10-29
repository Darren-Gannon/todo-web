import { User } from "../../../user";
import { UserRole } from "./user-role.enum";

export interface CreateBoardUser {
    email: User['email'];
    role: UserRole;
}