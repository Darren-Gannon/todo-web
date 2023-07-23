import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import * as BoardActions from './board.actions';
import { Board } from '../board';

export interface State extends EntityState<Board> {
    // additional entities state properties
    // selectedUserId: string | null;
}

export const adapter: EntityAdapter<Board> = createEntityAdapter<Board>({
    selectId: ({ id }) => id,
    sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectBoardState = createFeatureSelector('boards');

export const initialState = adapter.getInitialState({
    
    // additional entity state properties
});

export const BoardsReducer = createReducer(
    initialState,
    on(BoardActions.foundAllBoards, (state, { boards }) => adapter.setAll(boards, state)),
    on(BoardActions.createdBoard, (state, { board }) => adapter.addOne(board, state)),
    on(BoardActions.updatedBoard, (state, { board, updated }) => adapter.updateOne({
        id: board.id,
        changes: updated,
    }, state)),
    on(BoardActions.removedBoard, (state, { board }) => adapter.removeOne(board.id, state)),
);