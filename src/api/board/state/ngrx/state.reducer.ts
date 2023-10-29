import { createReducer, on } from '@ngrx/store';
import * as StateActions from './state.actions';
import { StateState } from './state.state';

export const StatesReducer = createReducer<StateState>(
    { data: new Map(), stale: true },
    on(StateActions.findAllStates, (state, { board }) => {
        let ret = { stale: true, data: new Map(state.data) }
        
        return ret;
    }),
    on(StateActions.foundAllStates, (state, { board, states }) => {
        let ret = { stale: false, data: new Map(state.data) }

        for(const _state of states)
            ret.data.set(_state.id, { data: _state, stale: false });
        
        return ret;
    }),
    on(StateActions.createState, (state, { board }) => {
        let ret = { stale: true, data: new Map(state.data) }
        return ret;
    }),
    on(StateActions.createdState, (state, { board, state: _state }) => {
        let ret = { stale: false, data: new Map(state.data) }
        ret.data.set(_state.id, { data: _state, stale: false });
        return ret;
    }),
    on(StateActions.createManyState, (state, { board }) => {
        let ret = { stale: true, data: new Map(state.data) }
        return ret;
    }),
    on(StateActions.createdManyState, (state, { board, states }) => {
        let ret = { stale: false, data: new Map(state.data) }
        for(const _state of states)
            ret.data.set(_state.id, { data: _state, stale: false });
        return ret;
    }),
    on(StateActions.updateState, (state, { board, state: _state, update }) => {
        let ret = { ...state, data: new Map(state.data) }
        const val = ret.data.get(_state.id);
        ret.data.set(_state.id, { data: {
            ...ret.data.get(_state.id)?.data!,
            ...update,
        }, stale: true });
        return ret;
    }),
    on(StateActions.updatedState, (state, { board, state: _state, updated }) => {
        let ret = { stale: false, data: new Map(state.data) }
        ret.data.set(_state.id, { data: updated, stale: false });
        return ret;
    }),
    on(StateActions.removeState, (state, { board, state: _state }) => {
        let ret = { ...state, data: new Map(state.data) }
        ret.data.set(_state.id, { ...ret.data.get(_state.id)!, stale: true });
        return ret;
    }),
    on(StateActions.removedState, (state, { board, state: _state }) => {
        let ret = { ...state, data: new Map(state.data) }
        ret.data.delete(_state.id);
        return ret;
    }),
);