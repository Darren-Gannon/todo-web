import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, scan, share, switchMap, take, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Config } from '../config';
import { BoardState, State } from './board-state';
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
  private readonly create_ = new Subject<CreateBoard>();
  private readonly update_ = new Subject<{ id: Board['id'], board: UpdateBoard }>();
  private readonly remove_ = new Subject<Board['id']>();

  private findAllStart$ = this.findAll_.asObservable().pipe(
    map(data => ({ type: 'findAll' })),
  );
  private findOneStart$ = this.findOne_.asObservable().pipe(
    map(data => ({ type: 'findOne', data })),
  );
  private createStart$ = this.create_.asObservable().pipe(
    map(data => ({ type: 'create', data })),
  );
  private updateStart$ = this.update_.asObservable().pipe(
    map(data => ({ type: 'update', data })),
  );
  private removeStart$ = this.remove_.asObservable().pipe(
    map(data => ({ type: 'remove', data })),
  );
  
  private findAllEnd$ = this.findAllStart$.pipe(
    switchMap(() => this.http.get<Board[]>(`${ this.config.apiUrl }/board`)),
    map(data => ({ type: 'foundAll', data })),
    share(),
  );
  private findOneEnd$ = this.findOneStart$.pipe(
    switchMap(({ data: id }) => this.http.get<Board>(`${ this.config.apiUrl }/board/${ id }`)),
    map(data => ({ type: 'foundOne', data })),
    share(),
  );
  private createEnd$ = this.createStart$.pipe(
    switchMap(({ data }) => this.http.post<Board>(`${ this.config.apiUrl }/board`, data)),
    map(data => ({ type: 'created', data })),
    share(),
  );
  private updateEnd$ = this.updateStart$.pipe(
    switchMap(({ data: { id, board } }) => this.http.patch<Board>(`${ this.config.apiUrl }/board/${ id }`, board)),
    map(data => ({ type: 'updated', data })),
    share(),
  );
  private removeEnd$ = this.removeStart$.pipe(
    switchMap(({ data: id }) => this.http.delete<Board>(`${ this.config.apiUrl }/board/${ id }`)),
    map(data => ({ type: 'removed', data })),
    share(),
  );
  private readonly state$: Observable<State> = merge(
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
      switch(action.type) {
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
              ...(action as any).data.reduce((acc: any, current: any) => ({ ...acc, [current.id]: {
                creating: false,
                updating: false,
                deleting: false,
                data: current,
              } }), {} as any) },
            loading: false,
            loaded: true,
          };
        case 'findOne':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data]: {
                ...state.data?.[(action as any).data],
                loading: true,
                loaded: false,
                updating: false,
                creating: false,
                deleting: false,
              } 
            },
            loading: false 
          };
        case 'foundOne':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data.id]: {
                ...state.data?.[(action as any).data.id],
                loading: false,
                loaded: true,
                data: (action as any).data,
              } 
            },
            loading: false 
          };
        case 'create':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data.id]: {
                loading: true,
                loaded: false,
                creating: true,
                updating: false,
                deleting: false,
                data: (action as any).data,
              },
            },
          };
        case 'created':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data.id]: {
                loading: false,
                loaded: true,
                ...state.data?.[(action as any).data.id],
                data: (action as any).data,
              },
            },
          };
        case 'update':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data.id]: {
                ...state.data?.[(action as any).data.id],
                updating: true,
                data: (action as any).data,
              },
            },
          };
        case 'updated':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data.id]: {
                ...state.data?.[(action as any).data.id],
                updating: false,
                data: (action as any).data,
              },
            },
          };
        case 'remove':
          return { 
            ...state, 
            data: { 
              ...state.data, 
              [(action as any).data]: {
                ...state.data?.[(action as any).data],
                deleting: true,
              },
            },
          };
        case 'removed':
          delete state?.data?.[(action as any).data.id];
          return state;
        default:
          return state;
      }
    }, ({ 
      loading: false,
      loaded: false,
      data: {},
    }) as State),
    share(),
  );

  find(): Observable<State> {
    this.findAll_.next(null);
    return this.state$;
  }

  findOne(id: Board['id']): Observable<BoardState | undefined> {
    this.findOne_.next(id);
    return this.state$.pipe(
      map(state => state.data?.[id]),
    );
  }

  create(board: CreateBoard): Observable<Board> {
    const id = uuid();
    setTimeout(() => this.create_.next({ 
      ...board,
      id,
    }), 0);
    return this.createEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }

  update(id: string, board: UpdateBoard): Observable<Board> {
    this.update_.next({ id, board });
    return this.updateEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }

  remove(id: string): Observable<Board> {
    this.remove_.next(id);
    return this.removeEnd$.pipe(
      map(state => state.data),
      take(1),
      share(),
    );
  }
}