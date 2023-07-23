import { createFeatureSelector, createReducer, on } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { State as StateModel } from '../state';
import * as StateActions from './state.actions';

export interface State extends EntityState<State> {
    // additional entities state properties
    // selectedUserId: string | null;
}

export const adapter: EntityAdapter<StateModel> = createEntityAdapter<StateModel>({
    selectId: ({ id }) => id,
    sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectBoardState = createFeatureSelector('states');

export const initialState = adapter.getInitialState({
    
    // additional entity state properties
});

export const StatesReducer = createReducer(
    initialState,
    on(StateActions.createdState, (state, { board, state: _state }) => adapter.addOne(_state, state)),
    on(StateActions.updatedState, (state, { board, state: _state }) => adapter.updateOne({ 
        id: _state.id,
        changes: _state,
    }, state)),
    on(StateActions.removedState, (state, { board, state: _state }) => adapter.removeOne(_state.id, state)),
    on(StateActions.swappedState, (state, { board, states }) => adapter.updateMany(states.map(state => ({
        id: state.id,
        changes: state,
    })), state)),
);