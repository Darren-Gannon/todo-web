import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, mergeMap, of, scan, share, take, zip } from 'rxjs';
import { Action } from 'src/api/action';
import { CacheCrud } from 'src/api/cache-crud';
import { v4 as uuid } from 'uuid';
import { Config } from '../../config';
import { Board } from '../dto/board.dto';
import { CreateState, State, UpdateState } from './dto';
import { StateState } from './state-state';

@Injectable()
export class StateService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }

  private readonly findAll_ = new Subject<Board['id']>();
  private readonly create_ = new Subject<{ boardId: Board['id'], state: CreateState & { id: string } }>();
  private readonly createMany_ = new Subject<{ boardId: Board['id'], states: CreateState[] }>();
  private readonly update_ = new Subject<{ boardId: Board['id'], id: State['id'], state: UpdateState }>();
  private readonly remove_ = new Subject<{ boardId: Board['id'], id: State['id'] }>();

  private readonly findAll$: Observable<ActionFindAll> = this.findAll_.pipe(
    map(data => ({ type: 'findAll', data })),
  );
  private readonly create$: Observable<ActionCreate> = this.create_.pipe(
    map(data => ({ type: 'create', data })),
  );
  private readonly createMany$: Observable<ActionCreateMany> = this.createMany_.pipe(
    map(data => ({ type: 'createMany', data })),
  );
  private readonly update$: Observable<ActionUpdate> = this.update_.pipe(
    map(data => ({ type: 'update', data })),
  );
  private readonly remove$: Observable<ActionRemove> = this.remove_.pipe(
    map(data => ({ type: 'remove', data })),
  );

  private readonly findAllEnd$: Observable<ActionFoundAll> = this.findAll$.pipe(
    mergeMap(action => zip(([
      this.http.get<State[]>(`${ this.config.apiUrl }/board/${ action.data }/state`),
      of(action.data),
    ]))),
    map(([states, boardId]) => ({ type: 'foundAll', data: { states, boardId } }))
  );
  private readonly createEnd$: Observable<ActionCreated> = this.create$.pipe(
    mergeMap(action => this.http.post<State>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state`, action.data.state)),
    map(data => ({ type: 'created', data } satisfies ActionCreated)),
    share(),
  );
  private readonly createManyEnd$: Observable<ActionCreatedMany> = this.createMany$.pipe(
    mergeMap(action => this.http.post<State[]>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state/many`, action.data.states)),
    map(data => ({ type: 'createdMany', data } satisfies ActionCreatedMany)),
    share(),
  );
  private readonly updateEnd$: Observable<ActionUpdated> = this.update$.pipe(
    mergeMap(action => this.http.patch<State>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state/${ action.data.id }`, action.data.state)),
    map(data => ({ type: 'updated', data } satisfies ActionUpdated)),
    share(),
  );
  private readonly removeEnd$: Observable<ActionRemoved> = this.remove$.pipe(
    mergeMap(action => this.http.delete<State>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state/${ action.data.id }`)),
    map(data => ({ type: 'removed', data } satisfies ActionRemoved)),
    share(),
  );

  private readonly state$: Observable<StateState> = merge(
    this.findAll$,
    this.create$,
    this.createMany$,
    this.update$,
    this.remove$,
    this.findAllEnd$,
    this.createEnd$,
    this.createManyEnd$,
    this.updateEnd$,
    this.removeEnd$,
  ).pipe(
    scan((state, action) => {
      switch (action.type) {
        case 'findAll':
          return {
            ...state,
            [action.data]: {
              ...state?.[action.data],
              loading: true,
            }
          } as StateState;
        case 'create':
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              data: {
                ...state?.[action.data.boardId].data,
                [action.data.state.id]: {
                  ...state?.[action.data.boardId].data?.[action.data.state.id],
                  creating: true,
                },
              }
            }
          } as StateState;
        // case 'createMany': // TODO
        case 'update':
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              data: {
                ...state?.[action.data.boardId].data,
                [action.data.id]: {
                  ...state?.[action.data.boardId].data?.[action.data.id],
                  updating: true,
                },
              },
            }
          } as StateState;
        case 'remove':
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              data: {
                ...state?.[action.data.boardId].data,
                [action.data.id]: {
                  ...state?.[action.data.boardId].data?.[action.data.id],
                  deleting: true,
                },
              },
            }
          } as StateState;
        case 'foundAll':
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              loading: false,
              loaded: true,
              data: action.data.states.reduce((acc, _state) => {
                acc[_state.id] = {
                  data: _state,
                  loading: false,
                  loaded: true,
                  creating: false,
                  updating: false,
                  deleting: false,
                };
                return acc;
              }, { } as { [stateId: string]: CacheCrud<State>; })
            },
          } as StateState;
        case 'created':
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              data: {
                ...state?.[action.data.boardId].data,
                [action.data.id]: {
                  deleting: false,
                  updating: false,
                  data: action.data,
                  loading: false,
                  loaded: true,
                  creating: false,
                },
              },
            }
          };
        // case 'createdMany': // TODO
        case 'updated':
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              data: {
                ...state?.[action.data.boardId].data,
                [action.data.id]: {
                  creating: false,
                  deleting: false,
                  data: action.data,
                  loading: false,
                  loaded: true,
                  updating: false,
                },
              },
              updating: false,
            }
          } as StateState;
        case 'removed':
          const updateState = state?.[action.data.boardId].data;
          if(updateState)
            delete updateState[action.data.id];
          return {
            ...state,
            [action.data.boardId]: {
              ...state?.[action.data.boardId],
              data: {
                ...updateState,
              },
            },
          } as StateState;
        default:
          return state;
      }
    }, {
    } as StateState),
    share(),
  );

  find(boardId: Board['id']): Observable<CacheCrud<{ [stateId: string]: CacheCrud<State>; }> | undefined> {
    setTimeout(() => this.findAll_.next(boardId), 0);
    return this.state$.pipe(
      map(state => state?.[boardId]),
    )
  }

  create(boardId: Board['id'], state: CreateState): Observable<State> {
    setTimeout(() => this.create_.next({ boardId, state: { ...state, id: uuid() } }), 0);
    return this.createEnd$.pipe(
      map(state => state?.data),
      take(1),
      share(),
    );
  }

  createMany(boardId: Board['id'], states: CreateState[]): Observable<State[]> {
    setTimeout(() => this.createMany_.next({ boardId, states }), 0);
    return this.createManyEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }

  update(boardId: Board['id'], id: State['id'], state: UpdateState): Observable<State> {
    setTimeout(() => this.update_.next({ boardId, id, state }), 0);
    return this.updateEnd$.pipe(
      map(state => state?.data),
      take(1),
      share(),
    );
  }

  remove(boardId: Board['id'], id: State['id']): Observable<State> {
    setTimeout(() => this.remove_.next({ boardId, id }), 0);
    return this.removeEnd$.pipe(
      map(state => state?.data),
      take(1),
      share(),
    );
  }
}

type ActionFindAll = Action<'findAll', Board['id']>;
type ActionCreate = Action<'create', { boardId: Board['id'], state: CreateState & { id: string } }>;
type ActionCreateMany = Action<'createMany', { boardId: Board['id'], states: CreateState[] }>;
type ActionUpdate = Action<'update', { boardId: Board['id'], id: State['id'], state: UpdateState }>;
type ActionRemove = Action<'remove', { boardId: Board['id'], id: State['id'] }>;
type ActionFoundAll = Action<'foundAll', { states: State[], boardId: Board['id'] }>;
type ActionCreated = Action<'created', State>;
type ActionCreatedMany = Action<'createdMany', State[]>;
type ActionUpdated = Action<'updated', State>;
type ActionRemoved = Action<'removed', State>;
