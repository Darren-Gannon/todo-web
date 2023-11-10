import { Task } from "./task.dto";

export type UpdateTask = Pick<Task, 'title' | 'description' | 'stateId'>