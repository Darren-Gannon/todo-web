import { createFeatureSelector, createReducer, on } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { Task } from '../task';
import * as TaskActions from './task.actions';

export interface State extends EntityState<State> {
    // additional entities state properties
    // selectedUserId: string | null;
}

export const adapter: EntityAdapter<Task> = createEntityAdapter<Task>({
    selectId: ({ id }) => id,
    sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectBoardState = createFeatureSelector('tasks');

export const initialState = adapter.getInitialState({
    
    // additional entity state properties
});

export const TaskReducer = createReducer(
    initialState,
    on(TaskActions.foundAllTasks, (state, { board, tasks }) => adapter.addMany(tasks, state)),
    on(TaskActions.createdTask, (state, { board, task }) => adapter.addOne(task, state)),
    on(TaskActions.updatedTask, (state, { board, task, updated }) => adapter.updateOne({ 
        id: task.id,
        changes: updated,
    }, state)),
    on(TaskActions.removedTask, (state, { board, task }) => adapter.removeOne(task.id, state)),
);