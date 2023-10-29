import { Board } from "./dto/board.dto";

export type State = BoardsState;

interface BoardsState {
    loading: boolean;
    loaded: boolean;
    data?: { [id: Board['id']]: BoardState };
}

export interface BoardState {
    loading: boolean;
    loaded: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    data?: Board;
}