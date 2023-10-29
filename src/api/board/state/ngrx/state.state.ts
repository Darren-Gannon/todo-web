import { CachedResult } from "../../../cache-result";
import { State } from "../state";

export type StateState = CachedResult<Map<State['id'], CachedResult<State>>>;