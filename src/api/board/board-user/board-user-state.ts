import { CacheCrud } from "../../cache-crud";
import { Board } from "../dto/board.dto";
import { BoardUser } from "./dto/board-user";

export type BoardUserState = CacheCrud<{
    [boardId: Board['id']]: CacheCrud<{
        [boardUserId: BoardUser['id']]: CacheCrud<BoardUser>; 
    }>;
}>;