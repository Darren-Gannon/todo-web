export type CacheCrud<T> = (LoadedType<T> | UnloadedType);

export interface BaseCrud {
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