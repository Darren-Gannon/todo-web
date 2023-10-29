export interface CachedResult<T> {
    stale: boolean;
    data: T;
}