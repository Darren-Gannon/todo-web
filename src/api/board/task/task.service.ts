import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, mergeMap, of, scan, share, take, zip } from 'rxjs';
import { Action } from 'src/api/action';
import { CacheCrud } from 'src/api/cache-crud';
import { v4 as uuid } from 'uuid';
import { Config } from '../../config';
import { Board } from '../dto/board.dto';
import { CreateTask } from './dto/create-task.dto';
import { Task } from './dto/task.dto';
import { UpdateTask } from './dto/update-task.dto';
import { TaskState } from './task.state';

@Injectable()
export class TaskService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }

  private readonly findAll_ = new Subject<Board['id']>();
  private readonly create_  = new Subject<{ boardId: Board['id'], task: _CreateTask }>();
  private readonly update_  = new Subject<{ boardId: Board['id'], id: Task['id'], task: UpdateTask }>();
  private readonly remove_  = new Subject<{ boardId: Board['id'], id: Task['id'] }>();

  private readonly findAll$: Observable<ActionFindAll> = this.findAll_.pipe(
    map(data => ({ type: 'findAll', data })),
  );
  private readonly create$: Observable<ActionCreate> = this.create_.pipe(
    map(data => ({ type: 'create', data })),
  );
  private readonly update$: Observable<ActionUpdate> = this.update_.pipe(
    map(data => ({ type: 'update', data })),
  );
  private readonly remove$: Observable<ActionRemove> = this.remove_.pipe(
    map(data => ({ type: 'remove', data })),
  );

  private readonly foundAll$: Observable<ActionFoundAll> = this.findAll$.pipe(
    mergeMap(action => zip(([
      this.http.get<Task[]>(`${ this.config.apiUrl }/board/${ action.data }/task`),
      of(action.data),
    ]))),
    map(([tasks, boardId]) => ({ type: 'foundAll', data: { tasks, boardId } } satisfies ActionFoundAll)),
    share(),
  );
  private readonly created$: Observable<ActionCreated> = this.create$.pipe(
    mergeMap(action => this.http.post<Task>(`${ this.config.apiUrl }/board/${ action.data.boardId }/task`, action.data.task)),
    map(data => ({ type: 'created', data } satisfies ActionCreated)),
    share(),
  );
  private readonly updated$: Observable<ActionUpdated> = this.update$.pipe(
    mergeMap(action => this.http.patch<Task>(`${ this.config.apiUrl }/board/${ action.data.boardId }/task/${ action.data.id }`, action.data.task)),
    map(data => ({ type: 'updated', data } satisfies ActionUpdated)),
    share(),
  );
  private readonly removed$ = this.remove$.pipe(
    mergeMap(action => this.http.delete<Task>(`${ this.config.apiUrl }/board/${ action.data.boardId }/task/${ action.data.id }`)),
    map(data => ({ type: 'removed', data } satisfies ActionRemoved)),
    share(),
  );

  private readonly state$: Observable<TaskState> = merge(
    this.findAll$,
    this.create$,
    this.update$,
    this.remove$,
    this.foundAll$,
    this.created$,
    this.updated$,
    this.removed$,
  ).pipe(
    scan((state, action) => {
      switch (action.type) {
        case 'findAll':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data]: {
                creating: false,
                deleting: false,
                loaded: false,
                updating: false,
                data: undefined,
                ...state.data?.[action.data],
                loading: true,
              },
            }
          };
        case 'create':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                deleting: false,
                updating: false,
                loaded: false,
                loading: false,
                data: undefined,
                ...state.data?.[action.data.boardId],
                creating: true,
              },
            }
          };
        case 'update':
          return {
            ...state,
            data: {
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                loaded: false,
                loading: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                data: {
                  ...state.data?.[action.data.boardId].data,
                  [action.data.id]: {
                    creating: false,
                    deleting: false,
                    loaded: false,
                    loading: false,
                    ...state.data?.[action.data.boardId].data?.[action.data.id],
                    updating: true,
                  },
                },
              },
            }
          };
        case 'remove':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                loaded: false,
                loading: false,
                updating: false,
                deleting: false,
                ...state.data?.[action.data.boardId],
                data: {
                  ...state.data?.[action.data.boardId].data,
                  [action.data.id]: {
                    creating: false,
                    loaded: false,
                    loading: false,
                    updating: false,
                    ...state.data?.[action.data.boardId].data?.[action.data.id],
                    deleting: true,
                  },
                },
              },
            }
          };
        case 'foundAll':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                loading: false,
                loaded: true,
                data: action.data.tasks.reduce((acc, task) => {
                  acc[task.id] = {
                    data: task,
                    loading: false,
                    loaded: true,
                    creating: false,
                    updating: false,
                    deleting: false,
                  };
                  return acc;
                }, { } as { [stateId: string]: CacheCrud<Task>; })
              },
            }
          };
        case 'created':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                loaded: false,
                loading: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                data: {
                  ...state.data?.[action.data.boardId].data,
                  [action.data.id]: {
                    deleting: false,
                    updating: false,
                    data: action.data,
                    loading: false,
                    loaded: true,
                    creating: false,
                  },
                },
              },
            }
          };
        case 'updated':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                loaded: false,
                loading: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                data: {
                  ...state.data?.[action.data.boardId].data,
                  [action.data.id]: {
                    creating: false,
                    deleting: false,
                    data: action.data,
                    loading: false,
                    loaded: true,
                    updating: false,
                  },
                },
              },
            }
          };
        case 'removed':
          const updateState = state.data?.[action.data.boardId].data;
          if(updateState)
            delete updateState[action.data.id];
          return {
            ...state,
            data: {
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                loaded: false,
                loading: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                data: {
                  ...updateState,
                },
              },
            }
          };
        default:
          return state;
      }
    }, {
      loading: false,
      loaded: false,
      creating: false,
      deleting: false,
      updating: false,
      data: {},
    } as TaskState),
  );
  
  find(boardId: Board['id']): Observable<CacheCrud<{ [taskId: string]: CacheCrud<Task>; }>> {
    setTimeout(() => this.findAll_.next(boardId), 0);
    return this.state$.pipe(
      map(state => state.data![boardId]),
    )
  }

  create(boardId: Board['id'], task: CreateTask): Observable<Task> {
    setTimeout(() => this.create_.next({ boardId, task: { ...task, id: uuid() } }), 0);
    return this.created$.pipe(
      map(state => state?.data),
      take(1),
      share(),
    );
  }

  update(boardId: Board['id'], id: Task['id'], task: UpdateTask): Observable<Task> {
    setTimeout(() => this.update_.next({ boardId, id, task }), 0);
    return this.updated$.pipe(
      map(state => state?.data),
      take(1),
      share(),
    );
  }

  remove(boardId: Board['id'], id: Task['id']): Observable<Task> {
    setTimeout(() => this.remove_.next({ boardId, id }), 0);
    return this.removed$.pipe(
      map(state => state?.data),
      take(1),
      share(),
    );
  }
}

type _CreateTask = Pick<Task, 'id' | 'title' | 'description' | 'stateId'>;

type ActionFindAll = Action<'findAll', Board['id']>;
type ActionCreate = Action<'create', { boardId: Board['id'], task: _CreateTask }>;
type ActionUpdate = Action<'update', { boardId: Board['id'], id: Task['id'], task: UpdateTask }>;
type ActionRemove = Action<'remove', { boardId: Board['id'], id: Task['id'] }>;
type ActionFoundAll = Action<'foundAll', { tasks: Task[], boardId: Board['id'] }>;
type ActionCreated = Action<'created', Task>;
type ActionUpdated = Action<'updated', Task>;
type ActionRemoved = Action<'removed', Task>;
