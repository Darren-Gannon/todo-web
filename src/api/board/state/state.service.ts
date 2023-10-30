import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, mergeMap, scan, share, take, tap, zip, of } from 'rxjs';
import { Config } from '../../config';
import { Board } from '../dto/board.dto';
import { CreateState, State, UpdateState } from './dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StateService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }

  private readonly findAll_ = new Subject<Board['id']>();
  private readonly create_ = new Subject<{ boardId: Board['id'], state: CreateState }>();
  private readonly createMany_ = new Subject<{ boardId: Board['id'], states: CreateState[] }>();
  private readonly update_ = new Subject<{ boardId: Board['id'], id: State['id'], state: UpdateState }>();
  private readonly remove_ = new Subject<{ boardId: Board['id'], id: State['id'] }>();

  private readonly findAll$ = this.findAll_.pipe(
    map(data => ({ type: 'findAll', data })),
  );
  private readonly create$ = this.create_.pipe(
    map(data => ({ type: 'create', data })),
  );
  private readonly createMany$ = this.createMany_.pipe(
    map(data => ({ type: 'createMany', data })),
  );
  private readonly update$ = this.update_.pipe(
    map(data => ({ type: 'update', data })),
  );
  private readonly remove$ = this.remove_.pipe(
    map(data => ({ type: 'remove', data })),
  );

  private readonly findAllEnd$ = this.findAll$.pipe(
    mergeMap(action => zip(([
      this.http.get<State[]>(`${ this.config.apiUrl }/board/${ action.data }/state`),
      of(action.data),
    ]))),
    map(([states, boardId]) => ({ type: 'foundAll', data: { states, boardId } }))
  );
  private readonly createEnd$ = this.create$.pipe(
    mergeMap(action => this.http.post<State>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state`, action.data.state)),
    map(data => ({ type: 'created', data })),
    share(),
  );
  private readonly createManyEnd$ = this.createMany$.pipe(
    mergeMap(action => this.http.post<State[]>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state/many`, action.data.states)),
    map(data => ({ type: 'createdMany', data })),
    share(),
  );
  private readonly updateEnd$ = this.update$.pipe(
    mergeMap(action => this.http.patch<State>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state/${ action.data.id }`, action.data.state)),
    map(data => ({ type: 'updated', data })),
    share(),
  );
  private readonly removeEnd$ = this.remove$.pipe(
    mergeMap(action => this.http.delete<State>(`${ this.config.apiUrl }/board/${ action.data.boardId }/state/${ action.data.id }`)),
    map(data => ({ type: 'removed', data })),
    share(),
  );

  private readonly state$ = merge(
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
            [(action as any).data]: {
              ...state[(action as any)],
              loading: true,
            },
          };
        case 'create':
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              creating: true,
            },
          };
        // case 'createMany': // TODO Find out why this isnt triggering
        case 'update':
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              data: {
                ...state[(action as any).data.boardId].data,
                [(action as any).data.id]: {
                  ...state[(action as any).data.boardId].data?.[(action as any).data.id],
                  updating: true,
                },
              },
            },
          };
        case 'remove':
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              data: {
                ...state[(action as any).data.boardId].data,
                [(action as any).data.id]: {
                  ...state[(action as any).data.boardId].data?.[(action as any).data.id],
                  removing: true,
                },
              },
            },
          };
        case 'foundAll':
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              data: (action as any).data.states.reduce((acc: any, state: any) => ({
                ...acc,
                [state.id]: {
                  data: state,
                  loading: false,
                  loaded: true,
                },
              }), {}),
              loading: false,
              loaded: true,
            },
          };
        case 'created':
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              data: {
                ...state[(action as any).data.boardId].data,
                [(action as any).data.id]: {
                  data: (action as any).data,
                  loading: false,
                  loaded: true,
                  creating: false,
                },
              },
            },
          };
        // case 'createdMany': // TODO Find out why this isnt triggering
        case 'updated':
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              data: {
                ...state[(action as any).data.boardId].data,
                [(action as any).data.id]: {
                  data: (action as any).data,
                  loading: false,
                  loaded: true,
                  updating: false,
                },
              },
            },
          };
        case 'removed':
          const updateState = state[(action as any).data.boardId].data;
          if(updateState)
            delete updateState[(action as any).data.id];
          return {
            ...state,
            [(action as any).data.boardId]: {
              ...state[(action as any).data.boardId],
              data: {
                ...updateState,
              },
            },
          };
        default:
          return state;
      }
    }, {  } as Cache),
  );

  find(boardId: Board['id']): Observable<BoardCache> {
    setTimeout(() => this.findAll_.next(boardId), 0);
    return this.state$.pipe(
      map(state => state[boardId]),
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

interface Cache {
  [boardId: string]: BoardCache;
}

interface BoardCache {
  loading: boolean;
  loaded: boolean;
  data?: {
    [stateId: string]: StateCache;
  };
}

interface StateCache {
  loading: boolean;
  loaded: boolean;
  creating: boolean;
  updating: boolean;
  removing: boolean;
  data?: State;
}

