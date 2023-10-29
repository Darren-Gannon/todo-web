import { createReducer, on } from '@ngrx/store';
import * as BoardActions from './board.actions';
import { BoardState } from './board.state';

export const BoardsReducer = createReducer<BoardState>(
    { data: new Map(), stale: true },
    on(BoardActions.findOneBoard, (state, { board }) => {
        const data = new Map(state.data);
        const cachedItem = data.get(board.id);
        if(!cachedItem)
            return state;
        data.set(board.id, { ...cachedItem, stale: true });
        return { ...state, data, };
    }),
    on(BoardActions.foundOneBoard, (state, { board }) => {
        const data = new Map(state.data);
        data.set(board.id, { data: board, stale: false });
        return { ...state, data };
    }),
    on(BoardActions.findAllBoards, (state, {}) => {
        const data = new Map(state.data);
        data.forEach(item => item.stale = true);
        return { data, stale: true };
    }),
    on(BoardActions.foundAllBoards, (state, { boards }) => {
        const data = new Map(boards.map(board => [board.id, ({ data: board, stale: false })]));
        return { data, stale: false };
    }),
    on(BoardActions.createBoard, (state, {}) => {
        const ret = { data: new Map(state.data), stale: true };
        return ret;
    }),
    on(BoardActions.createdBoard, (state, { board }) => {
        const ret = { data: new Map(state.data), stale: false };
        ret.data.set(board.id, { data: board, stale: false });
        return ret;
    }),
    on(BoardActions.updateBoard, (state, { board, update }) => {
        const ret = { data: new Map(state.data), stale: false };
        
        ret.data.set(board.id, { stale: true, data: {
            ...state.data.get(board.id)?.data!,
            ...update,
        } });
        return ret;
    }),
    on(BoardActions.updatedBoard, (state, { board, updated }) => {
        const ret = { data: new Map(state.data), stale: false };
        ret.data.set(board.id, { data: updated, stale: false });
        return ret;
    }),
    on(BoardActions.removeBoard, (state, { board }) => {
        const ret = { data: new Map(state.data), stale: false };
        ret.data.set(board.id, { data: ret.data.get(board.id)?.data!, stale: true });
        return ret;
    }),
    on(BoardActions.removedBoard, (state, { board }) => {
        const ret = { data: new Map(state.data), stale: false };
        ret.data.delete(board.id);
        return ret;
    }),
);