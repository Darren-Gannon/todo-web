import { Task } from "../dto/task.dto";

export interface TaskState {
    data: Map<Task['id'], Task>
}