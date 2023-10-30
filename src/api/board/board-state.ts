import { BaseCrud, CacheCrud } from "../cache-crud";
import { Board } from "./dto/board.dto";

export type State = CacheCrud<{ 
    [id: Board['id']]: (CacheCrud<Board> & BaseCrud) 
}> & { loading: boolean };
