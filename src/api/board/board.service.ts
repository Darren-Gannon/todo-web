import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, mergeMap, scan, share, take, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Action } from '../action';
import { CacheCrud } from '../cache-crud';
import { Config } from '../config';
import { BoardState } from './board-state';
import { Board } from './dto/board.dto';
import { CreateBoard } from './dto/create-board.dto';
import { UpdateBoard } from './dto/update-board.dto';

@Injectable()
export class BoardService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }

  private readonly findAll_ = new Subject();
  private readonly findOne_ = new Subject<Board['id']>();
  private readonly create_ = new Subject<_CreateBoard>();
  private readonly update_ = new Subject<{ id: Board['id'], board: UpdateBoard }>();
  private readonly remove_ = new Subject<Board['id']>();

  private findAllStart$: Observable<ActionFindAll> = this.findAll_.asObservable().pipe(
    map(data => ({ type: 'findAll', data: null })),
  );
  private findOneStart$: Observable<ActionFindOne> = this.findOne_.asObservable().pipe(
    map(data => ({ type: 'findOne', data })),
  );
  private createStart$: Observable<ActionCreate> = this.create_.asObservable().pipe(
    map(data => ({ type: 'create', data })),
  );
  private updateStart$: Observable<ActionUpdate> = this.update_.asObservable().pipe(
    map(data => ({ type: 'update', data })),
  );
  private removeStart$: Observable<ActionRemove> = this.remove_.asObservable().pipe(
    map(data => ({ type: 'remove', data })),
  );

  private findAllEnd$: Observable<ActionFoundAll> = this.findAllStart$.pipe(
    mergeMap(() => this.http.get<Board[]>(`${this.config.apiUrl}/board`)),
    map(data => ({ type: 'foundAll', data } satisfies ActionFoundAll)),
    share(),
  );
  private findOneEnd$: Observable<ActionFoundOne> = this.findOneStart$.pipe(
    mergeMap(({ data: id }) => this.http.get<Board>(`${this.config.apiUrl}/board/${id}`)),
    map(data => ({ type: 'foundOne', data } satisfies ActionFoundOne)),
    share(),
  );
  private createEnd$: Observable<ActionCreated> = this.createStart$.pipe(
    mergeMap(({ data }) => this.http.post<Board>(`${this.config.apiUrl}/board`, data)),
    map(data => ({ type: 'created', data } satisfies ActionCreated)),
    share(),
  );
  private updateEnd$: Observable<ActionUpdated> = this.updateStart$.pipe(
    mergeMap(({ data: { id, board } }) => this.http.patch<Board>(`${this.config.apiUrl}/board/${id}`, board)),
    map(data => ({ type: 'updated', data } satisfies ActionUpdated)),
    share(),
  );
  private removeEnd$: Observable<ActionRemoved> = this.removeStart$.pipe(
    mergeMap(({ data: id }) => this.http.delete<Board>(`${this.config.apiUrl}/board/${id}`)),
    map(data => ({ type: 'removed', data } satisfies ActionRemoved)),
    share(),
  );
  private readonly state$: Observable<BoardState> = merge(
    this.findAllStart$,
    this.findOneStart$,
    this.createStart$,
    this.updateStart$,
    this.removeStart$,
    this.findAllEnd$,
    this.findOneEnd$,
    this.createEnd$,
    this.updateEnd$,
    this.removeEnd$,
  ).pipe(
    scan((state, action) => {
      switch (action.type) {
        case 'findAll':
          return {
            ...state,
            loading: true,
          };
        case 'foundAll':
          return {
            ...state,
            data: {
              ...state.data,
              ...action.data.reduce((acc: any, board: Board) => ({
                ...acc,
                [board.id]: {
                  loaded: true,
                  data: board,
                },
              }), {}),
            },
            loading: false,
            loaded: true,
          };
        case 'findOne':          
          return {
            ...state,
            data: {
              ...state.data,
              [action.data]: {
                ...state.data?.[action.data],
                loading: true,
              },
            },
          };
        case 'foundOne':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.id]: {
                ...state.data?.[action.data.id],
                loading: false,
                loaded: true,
                data: action.data,
              },
            },
          };
        case 'create':
          return {
            ...state,
            data: {
              ...state?.data,
              [action.data.id]: {
                loading: true,
                creating: true,
                data: action.data,
              },
            },
          };
        case 'created':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.id]: {
                ...state.data?.[action.data.id],
                loading: false,
                loaded: true,
                data: action.data,
              },
            },
          };
        case 'update':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.id]: {
                ...state.data?.[action.data.id],
                updating: true,
                data: action.data,
              },
            },
          };
        case 'updated':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.id]: {
                ...state.data?.[action.data.id],
                updating: false,
                data: action.data,
              },
            },
          };
        case 'remove':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data]: {
                ...state.data?.[action.data],
                deleting: true,
              },
            },
          };
        case 'removed':
          delete state.data?.[action.data.id];
          return state;
        default:
          return state;
      }
    }, ({
      data: {},
    }) as BoardState),
    share(),
  );

  find(): Observable<BoardState> {
    setTimeout(() => this.findAll_.next(null), 0);
    return this.state$.pipe(
      share(),
    );
  }

  findOne(id: Board['id']): Observable<CacheCrud<Board> | undefined> {
    setTimeout(() => this.findOne_.next(id), 0);
    return this.state$.pipe(
      map(state => state.data?.[id]),
    );
  }

  create(board: CreateBoard): Observable<Board> {
    const id = uuid();
    setTimeout(() => this.create_.next({ ...board, id, }), 0);
    return this.createEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }

  update(id: string, board: UpdateBoard): Observable<Board> {
    setTimeout(() => this.update_.next({ id, board }), 0);
    return this.updateEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }

  remove(id: string): Observable<Board> {
    setTimeout(() => this.remove_.next(id), 0);
    return this.removeEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }
}

type _CreateBoard = Pick<Board, 'id' | 'title'>;

type ActionFindAll = Action<'findAll', null>;
type ActionFindOne = Action<'findOne', string>;
type ActionCreate = Action<'create', _CreateBoard>;
type ActionUpdate = Action<'update', { id: string, board: UpdateBoard }>;
type ActionRemove = Action<'remove', string>;
type ActionFoundAll = Action<'foundAll', Board[]>;
type ActionFoundOne = Action<'foundOne', Board>;
type ActionCreated = Action<'created', Board>;
type ActionUpdated = Action<'updated', Board>;
type ActionRemoved = Action<'removed', Board>;