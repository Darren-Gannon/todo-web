import { Board } from "../../dto/board.dto";
import { UserRole } from "./user-role.enum";

export interface BoardUser {
    id: string;
    userId: string;
    role: UserRole;
    createdAt: Date;
    boardId: Board['id'];
    email: string;
    name: string;
    family_name: string;
    given_name: string;
    picture: string;
}
