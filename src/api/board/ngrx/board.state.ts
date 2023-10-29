import { CachedResult } from "../../cache-result";
import { Board } from "../board";

export type BoardState = CachedResult<Map<Board['id'], CachedResult<Board>>>;