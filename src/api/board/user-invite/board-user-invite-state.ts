import { CacheCrud } from "src/api/cache-crud";
import { Board } from "../dto/board.dto";
import { UserInvite } from "./dto/user-invite.dto";

export type BoardUserInviteState = CacheCrud<{
    [boardId: Board['id']]: CacheCrud<{
        [userInviteId: UserInvite['id']]: CacheCrud<UserInvite>;
    }>;
}>;