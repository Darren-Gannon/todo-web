export type Action<Type extends string, Data> = {
    type: Type;
    data: Data;
};
