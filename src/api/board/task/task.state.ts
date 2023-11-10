import { CacheCrud } from "src/api/cache-crud";
import { Task } from "./dto/task.dto";
import { Board } from "../dto/board.dto";

export type TaskState = CacheCrud<{
    [boardId: Board['id']]: CacheCrud<{
        [taskId: Task['id']]: CacheCrud<Task>;
    }>;
}>;