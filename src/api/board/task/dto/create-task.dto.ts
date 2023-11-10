import { Task } from "./task.dto";

export type CreateTask = Pick<Task, 'title' | 'description' | 'stateId'>