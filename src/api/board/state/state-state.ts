import { CacheCrud } from "../../cache-crud";
import { Board } from "../dto/board.dto";
import { State } from "./dto";

export type StateState = {
    [boardId: Board['id']]: CacheCrud<{
        [stateId: State['id']]: CacheCrud<State>; 
    }>;
};