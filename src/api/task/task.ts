import { State } from "../state";

export interface Task {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    stateId: State['id'];
}