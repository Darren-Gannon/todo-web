import { createAction, props } from '@ngrx/store';
import { Task } from '../dto/task.dto';
import { Board } from '../../dto/board.dto';

export const createTask = createAction('[Task] create', props<{ board: Pick<Board, 'id'>, task: Pick<Task, 'title' | 'description' | 'stateId'> }>());
export const createdTask = createAction('[Task] created', props<{ board: Pick<Board, 'id'>, task: Task }>());
export const findAllTasks = createAction('[Task] findAll', props<{ board: Pick<Board, 'id'> }>());
export const foundAllTasks = createAction('[Task] foundAll', props<{ board: Pick<Board, 'id'>, tasks: Task[] }>());
export const findOneTask = createAction('[Task] findOne', props<{ board: Pick<Board, 'id'>, task: Pick<Task, 'id'> }>());
export const updateTask = createAction('[Task] update', props<{ board: Pick<Board, 'id'>, task: Pick<Task, 'id'>, update: Pick<Task, 'title' | 'description' | 'stateId'> }>());
export const updatedTask = createAction('[Task] updated', props<{ board: Pick<Board, 'id'>, task: Pick<Task, 'id'>; updated: Task }>());
export const removeTask = createAction('[Task] remove', props<{ board: Pick<Board, 'id'>, task: Pick<Task, 'id'> }>());
export const removedTask = createAction('[Task] removed', props<{ board: Pick<Board, 'id'>, task: Task }>());
