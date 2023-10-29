import { Task } from "../task";

export interface TaskState {
    data: Map<Task['id'], Task>
}