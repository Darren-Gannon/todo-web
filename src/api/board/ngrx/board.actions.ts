import { createAction, props } from '@ngrx/store';
import { Board } from '../board';

export const createBoard = createAction('[Board] create', props<{ board: Pick<Board, 'title'> }>());
export const createdBoard = createAction('[Board] created', props<{ board: Board }>());
export const findAllBoards = createAction('[Board] findAll');
export const foundAllBoards = createAction('[Board] foundAll', props<{ boards: Board[] }>());
export const findOneBoard = createAction('[Board] findOne', props<{ board: Pick<Board, 'id'> }>());
export const foundOneBoard = createAction('[Board] foundOne', props<{ board: Board }>());
export const updateBoard = createAction('[Board] update', props<{ board: Pick<Board, 'id'>, update: Pick<Board, 'title'> }>());
export const updatedBoard = createAction('[Board] updated', props<{ board: Pick<Board, 'id'>; updated: Board }>());
export const removeBoard = createAction('[Board] remove', props<{ board: Pick<Board, 'id'> }>());
export const removedBoard = createAction('[Board] removed', props<{ board: Board }>());