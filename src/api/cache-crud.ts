export type CacheCrud<T> = (LoadedType<T> | UnloadedType) & BaseCrud<T>;

interface BaseCrud<T> {
    data?: T;
    loading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
}

type LoadedType<T> = {
    loaded: true;
    data: T;
};

type UnloadedType = {
    loaded: false;
};