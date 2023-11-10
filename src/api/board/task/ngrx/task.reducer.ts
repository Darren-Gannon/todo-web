import { createReducer, on } from '@ngrx/store';
import { Task } from '../dto/task.dto';
import * as TaskActions from './task.actions';

export const TaskReducer = createReducer(
    { data: new Map() },
    on(TaskActions.foundAllTasks, (state, { board, tasks }) => {
        const ret = { data: new Map(state.data) }
        for(const task of tasks)
            ret.data.set(task.id, task);
        return ret;
    }),
    on(TaskActions.createdTask, (state, { board, task }) => {
        const ret = { data: new Map(state.data) }
        ret.data.set(task.id, task);
        return ret;
    }),
    on(TaskActions.updatedTask, (state, { board, task, updated }) => {
        const ret = { data: new Map(state.data) }
        ret.data.set(task.id, updated);
        return ret;
    }),
    on(TaskActions.removedTask, (state, { board, task }) => {
        const ret = { data: new Map(state.data) }
        ret.data.delete(task.id);
        return ret;
    }),
);