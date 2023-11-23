import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, map, of, scan, share, switchMap, tap, merge, take } from 'rxjs';
import { Config } from '../../config';
import { Board } from '../dto/board.dto';
import { BoardUser } from './dto/board-user';
import { Action } from '../../action';
import { BoardUserState } from './board-user-state';
import { CacheCrud } from 'src/api/cache-crud';

@Injectable()
export class BoardUserService {

  constructor(
    private readonly config: Config,
    private readonly http: HttpClient,
  ) { }

  private readonly findAllForBoard_ = new Subject<string>();
  
  private readonly updateUser_ = new Subject<{ boardId: string, userId: string, user: Pick<BoardUser, 'role'> }>();

  private readonly findAllForBoard$: Observable<ActionFindAllForBoard> = this.findAllForBoard_.asObservable().pipe(
    map(boardId => ({ type: 'findAllForBoard', data: { boardId } })),
  );
  private readonly updateUser$: Observable<ActionUpdateUser> = this.updateUser_.asObservable().pipe(
    map(({ boardId, userId, user }) => ({ type: 'updateUser', data: { boardId, userId, user } })),
  );

  private readonly foundAllForBoard$: Observable<ActionFoundAllForBoard> = this.findAllForBoard$.pipe(
    switchMap(({ data: { boardId } }) => combineLatest([
      of(boardId),
      this.http.get<BoardUser[]>(`${ this.config.apiUrl }/board/${ boardId }/user`),
    ])),
    map(([boardId, users]) => ({ type: 'foundAllForBoard', data: { boardId, users } }) satisfies ActionFoundAllForBoard),
    share(),
  );
  private readonly updatedUser$: Observable<ActionUpdatedUser> = this.updateUser$.pipe(
    switchMap(({ data: { boardId, userId, user } }) => combineLatest([
      of({ boardId, userId, user }),
      this.http.patch<BoardUser>(`${ this.config.apiUrl }/board/${ boardId }/user/${ userId }`, user),
    ])),
    map(([{ boardId, userId, user }, updatedUser]) => ({ type: 'updatedUser', data: { boardId, userId, user: updatedUser } }) satisfies ActionUpdatedUser),
    share(),
  );

  private readonly state$: Observable<BoardUserState> = merge(
    this.findAllForBoard$,
    this.updateUser$,
    this.foundAllForBoard$,
    this.updatedUser$,
  ).pipe(
    scan((state, action) => {
      switch (action.type) {
        case 'findAllForBoard':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                loaded: false,
                data: {
                  ...state.data?.[action.data.boardId]?.data,
                },
                loading: true,
              },
            }
          };
        case 'updateUser':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                data: {
                  ...state.data?.[action.data.boardId]?.data,
                  [action.data.userId]: {
                    creating: false,
                    deleting: false,
                    loaded: false,
                    loading: false,
                    data: state.data?.[action.data.boardId]?.data?.[action.data.userId].data!,
                    ...state.data?.[action.data.boardId]?.data?.[action.data.userId],
                    updating: true,
                  },
                },
                loaded: true,
                loading: false,
              },
            }
          };
        case 'foundAllForBoard':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                data: {
                  ...state.data?.[action.data.boardId]?.data,
                  ...action.data.users.reduce((acc, user) => ({ 
                    ...acc,
                    [user.id]: {
                      creating: false,
                      deleting: false,
                      updating: false,
                      data: user,
                      loaded: true,
                      loading: false,
                    },
                  }), { } as { [boardUserId: string]: CacheCrud<BoardUser> }),
                },
                loaded: true,
                loading: false,
              },
            }
          };
        case 'updatedUser':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                data: {
                  ...state.data?.[action.data.boardId]?.data,
                  [action.data.userId]: {
                    creating: false,
                    deleting: false,
                    loaded: false,
                    loading: false,
                    ...state.data?.[action.data.boardId]?.data?.[action.data.userId],
                    data: {
                      ...state.data?.[action.data.boardId]?.data?.[action.data.userId].data,
                      ...action.data.user,
                    },
                    updating: false,
                  },
                },
                loaded: true,
                loading: false,
              },
            }
          };
        default:
          return state;
      }
    }, {
      creating: false,
      deleting: false,
      loaded: false,
      loading: false,
      updating: false,
      data: {},
    } as BoardUserState),
    share(),
  )

  private state: State = {};
  private readonly state_ = new BehaviorSubject<State>({});
  
  public findAll(boardId: string): Observable<{ [boardUserId: string]: CacheCrud<BoardUser> } | undefined> {
    setTimeout(() => this.findAllForBoard_.next(boardId), 0);
    return this.state$.pipe(
      map(state => state.data?.[boardId]?.data),
    );
  }

  public updateUser(boardId: string, userId: string, user: Pick<BoardUser, 'role'>): Observable<BoardUser | undefined> {
    setTimeout(() => this.updateUser_.next({ boardId, userId, user }), 0);
    return this.state$.pipe(
      map(state => state.data?.[boardId]?.data?.[userId]?.data),
      take(1),
    );
  }
  // TODO Add Remove User
}

type State = { [boardId: Board['id']]: StateItem };

type StateItem = {
  [userId: BoardUser['id']]: BoardUser
};

type ActionFindAllForBoard = Action<'findAllForBoard', { boardId: string }>;
type ActionFoundAllForBoard = Action<'foundAllForBoard', { boardId: string, users: BoardUser[] }>;
type ActionUpdateUser = Action<'updateUser', { boardId: string, userId: string, user: Pick<BoardUser, 'role'> }>;
type ActionUpdatedUser = Action<'updatedUser', { boardId: string, userId: string, user: BoardUser }>;