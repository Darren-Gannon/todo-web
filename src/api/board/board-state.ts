import { CacheCrud } from "../cache-crud";
import { Board } from "./dto/board.dto";

export type BoardState = CacheCrud<{ 
    [id: Board['id']]: CacheCrud<Board> 
}>;