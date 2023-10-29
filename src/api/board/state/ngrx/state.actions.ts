import { createAction, props } from '@ngrx/store';
import { State } from '../state';
import { Board } from '../../board';

export const createState = createAction('[State] create one', props<{ board: Pick<Board, 'id'>, state: Pick<State, 'title'> }>());
export const createdState = createAction('[State] created one', props<{ board: Pick<Board, 'id'>, state: State }>());
export const createManyState = createAction('[State] create many', props<{ board: Pick<Board, 'id'>, states: Pick<State, 'title'>[] }>());
export const createdManyState = createAction('[State] created many', props<{ board: Pick<Board, 'id'>, states: State[] }>());
export const findAllStates = createAction('[State] findAll', props<{ board: Pick<Board, 'id'> }>());
export const foundAllStates = createAction('[State] foundAll', props<{ board: Pick<Board, 'id'>, states: State[] }>());
export const findOneState = createAction('[State] findOne', props<{ board: Pick<Board, 'id'>, state: Pick<State, 'id'> }>());
export const updateState = createAction('[State] update', props<{ board: Pick<Board, 'id'>, state: Pick<State, 'id'>, update: Pick<State, 'title'> }>());
export const updatedState = createAction('[State] updated', props<{ board: Pick<Board, 'id'>, state: Pick<State, 'id'>; updated: State }>());
export const removeState = createAction('[State] remove', props<{ board: Pick<Board, 'id'>, state: Pick<State, 'id'> }>());
export const removedState = createAction('[State] removed', props<{ board: Pick<Board, 'id'>, state: State }>());
