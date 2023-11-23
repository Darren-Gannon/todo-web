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
  private readonly removeUser_ = new Subject<{ boardId: string, userId: string }>();

  private readonly findAllForBoard$: Observable<ActionFindAllForBoard> = this.findAllForBoard_.asObservable().pipe(
    map(boardId => ({ type: 'findAllForBoard', data: { boardId } })),
  );
  private readonly updateUser$: Observable<ActionUpdateUser> = this.updateUser_.asObservable().pipe(
    map(({ boardId, userId, user }) => ({ type: 'updateUser', data: { boardId, userId, user } })),
  );
  private readonly removeUser$: Observable<ActionRemoveUser> = this.removeUser_.asObservable().pipe(
    map(({ boardId, userId }) => ({ type: 'removeUser', data: { boardId, userId } })),
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
  private readonly removedUser$: Observable<ActionRemovedUser> = this.removeUser$.pipe(
    switchMap(({ data: { boardId, userId } }) => combineLatest([
      of({ boardId, userId }),
      this.http.delete<BoardUser>(`${ this.config.apiUrl }/board/${ boardId }/user/${ userId }`),
    ])),
    map(([{ boardId, userId }, removedUser]) => ({ type: 'removedUser', data: { boardId, userId } }) satisfies ActionRemovedUser),
    share(),
  );

  private readonly state$: Observable<BoardUserState> = merge(
    this.findAllForBoard$,
    this.updateUser$,
    this.removeUser$,
    this.foundAllForBoard$,
    this.updatedUser$,
    this.removedUser$,
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
        case 'removeUser':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                loaded: false,
                loading: false,
                data: {
                  ...state.data?.[action.data.boardId]?.data,
                  [action.data.userId]: {
                    creating: false,
                    loaded: false,
                    loading: false,
                    data: state.data?.[action.data.boardId]?.data?.[action.data.userId].data!,
                    updating: false,
                    ...state.data?.[action.data.boardId]?.data?.[action.data.userId],
                    deleting: true,
                  },
                },
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
        case 'removedUser':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                loaded: false,
                loading: false,
                data: Object.entries(state.data?.[action.data.boardId]?.data ?? {}).reduce((acc, [boardUserId, boardUser]) => {
                  if (boardUserId === action.data.userId) {
                    return acc;
                  }
                  return {
                    ...acc,
                    [boardUserId]: boardUser,
                  };
                }, { } as { [boardUserId: string]: CacheCrud<BoardUser> }),
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

  public removeUser(boardId: string, userId: string): Observable<BoardUser | undefined> {
    setTimeout(() => this.removeUser_.next({ boardId, userId }), 0);
    return this.state$.pipe(
      map(state => state.data?.[boardId]?.data?.[userId]?.data),
      take(1),
    );
  }
}

type State = { [boardId: Board['id']]: StateItem };

type StateItem = {
  [userId: BoardUser['id']]: BoardUser
};

type ActionFindAllForBoard = Action<'findAllForBoard', { boardId: string }>;
type ActionFoundAllForBoard = Action<'foundAllForBoard', { boardId: string, users: BoardUser[] }>;
type ActionUpdateUser = Action<'updateUser', { boardId: string, userId: string, user: Pick<BoardUser, 'role'> }>;
type ActionUpdatedUser = Action<'updatedUser', { boardId: string, userId: string, user: BoardUser }>;
type ActionRemoveUser = Action<'removeUser', { boardId: string, userId: string }>;
type ActionRemovedUser = Action<'removedUser', { boardId: string, userId: string }>;