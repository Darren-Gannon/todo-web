import { State } from "./state.dto";

export type CreateState =  Partial<Pick<State, 'id'>> & Pick<State, 'title'>;