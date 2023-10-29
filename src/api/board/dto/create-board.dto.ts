import { Board } from "./board.dto";

export type CreateBoard = Partial<Pick<Board, 'id'>> & Pick<Board, 'title'>;