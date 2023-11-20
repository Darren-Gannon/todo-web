import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, mergeMap, scan, share } from 'rxjs';
import { Action } from 'src/api/action';
import { v4 as uuid } from 'uuid';
import { Config } from '../../config';
import { BoardUserInviteState } from './board-user-invite-state';
import { CreateUserInviteDto } from './dto/create-user-invite.dto';
import { UpdateUserInviteDto } from './dto/update-user-invite.dto';
import { UserInvite } from './dto/user-invite.dto';

@Injectable()
export class UserInviteService {

  constructor(
    private readonly config: Config,
    private readonly http: HttpClient,
  ) { }

  private readonly findAllForBoard_ = new Subject<{ boardId: string; }>();
  private readonly findOneForBoard_ = new Subject<{ boardId: string; inviteId: string; }>();
  private readonly createForBoard_ = new Subject<{ boardId: string; userInvite: CreateUserInviteDto; }>();
  private readonly updateForBoard_ = new Subject<{ boardId: string, inviteId: string, userInvite: UpdateUserInviteDto }>();
  private readonly removeForBoard_ = new Subject<{ boardId: string; inviteId: string; }>();

  private readonly findAllForBoard$: Observable<ActionFindAllForBoard> = this.findAllForBoard_.pipe(
    map(({ boardId }) => ({ type: 'findAllForBoard', data: { boardId } })),
  );
  private readonly findOneForBoard$: Observable<ActionFindOneForBoard> = this.findOneForBoard_.pipe(
    map(({ boardId, inviteId }) => ({ type: 'findOneForBoard', data: { boardId, inviteId } })),
  );
  private readonly createForBoard$: Observable<ActionCreateForBoard> = this.createForBoard_.pipe(
    map(({ boardId, userInvite }) => ({ type: 'createForBoard', data: { boardId, userInvite: { id: uuid(), ...userInvite } } })),
  );
  private readonly updateForBoard$: Observable<ActionUpdateForBoard> = this.updateForBoard_.pipe(
    map(({ boardId, inviteId, userInvite }) => ({ type: 'updateForBoard', data: { boardId, inviteId, userInvite } })),
  );
  private readonly removeForBoard$: Observable<ActionRemoveForBoard> = this.removeForBoard_.pipe(
    map(({ boardId, inviteId }) => ({ type: 'removeForBoard', data: { boardId, inviteId } })),
  );
  private readonly foundAllForBoard$: Observable<ActionFoundAllForBoard> = this.findAllForBoard$.pipe(
    mergeMap(({ data: { boardId }}) => this.http.get<UserInvite[]>(`${ this.config.apiUrl }/board/${ boardId }/user-invite`)),
    share(),
    map(userInvites => ({ type: 'foundAllForBoard', data: { boardId: userInvites[0].boardId, userInvites } } satisfies ActionFoundAllForBoard)),
  );
  private readonly foundOneForBoard$: Observable<ActionFoundOneForBoard> = this.findOneForBoard$.pipe(
    mergeMap(({ data: { boardId, inviteId }}) => this.http.get<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`)),
    share(),
    map(userInvite => ({ type: 'foundOneForBoard', data: { boardId: userInvite.boardId, userInvite } } satisfies ActionFoundOneForBoard)),
  );
  private readonly createdForBoard$: Observable<ActionCreatedForBoard> = this.createForBoard$.pipe(
    mergeMap(({ data: { boardId, userInvite }}) => this.http.post<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite`, userInvite)),
    share(),
    map(userInvite => ({ type: 'createdForBoard', data: { boardId: userInvite.boardId, userInvite } } satisfies ActionCreatedForBoard)),
  );
  private readonly updatedForBoard$: Observable<ActionUpdatedForBoard> = this.updateForBoard$.pipe(
    mergeMap(({ data: { boardId, inviteId, userInvite }}) => this.http.patch<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`, userInvite)),
    share(),
    map(userInvite => ({ type: 'updatedForBoard', data: { boardId: userInvite.boardId, userInvite } } satisfies ActionUpdatedForBoard)),
  );
  private readonly removedForBoard$: Observable<ActionRemovedForBoard> = this.removeForBoard$.pipe(
    mergeMap(({ data: { boardId, inviteId }}) => this.http.delete<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`)),
    share(),
    map(userInvite => ({ type: 'removedForBoard', data: { boardId: userInvite.boardId, inviteId: userInvite.id } } satisfies ActionRemovedForBoard)),
  );

  private readonly findAllForUser_ = new Subject<ActionFindAllForUser>();
  private readonly findOneForUser_ = new Subject<ActionFindOneForUser>();
  private readonly approveForUser_ = new Subject<ActionApproveForUser>();
  private readonly removeForUser_ = new Subject<ActionRemoveForUser>();
  private readonly foundAllForUser_ = new Subject<ActionFoundAllForUser>();
  private readonly foundOneForUser_ = new Subject<ActionFoundOneForUser>();
  private readonly approvedForUser_ = new Subject<ActionApprovedForUser>();
  private readonly removedForUser_ = new Subject<ActionRemovedForUser>();

  private readonly boardState$: Observable<BoardUserInviteState> = merge(
    this.findAllForBoard$,
    this.findOneForBoard$,
    this.createForBoard$,
    this.updateForBoard$,
    this.removeForBoard$,
    this.foundAllForBoard$,
    this.foundOneForBoard$,
    this.createdForBoard$,
    this.updatedForBoard$,
    this.removedForBoard$,
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
                loaded: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                loading: true,
              },
            },
          };
        // case 'findOneForBoard':
        // case 'createForBoard':
        // case 'updateForBoard':
        // case 'removeForBoard':
        case 'foundAllForBoard':
          return {
            ...state,
            data: {
              ...state.data,
              [action.data.boardId]: {
                creating: false,
                deleting: false,
                updating: false,
                ...state.data?.[action.data.boardId],
                loaded: true,
                loading: false,
                data: action.data.userInvites.reduce((acc, userInvite) => ({
                  ...acc,
                  [userInvite.id]: {
                    creating: false,
                    deleting: false,
                    updating: false,
                    ...state.data?.[action.data.boardId]?.data?.[userInvite.id],
                    loaded: true,
                    loading: false,
                    data: userInvite,
                  },
                }), {}),
              },
            },
          };
        // case 'foundOneForBoard':
        // case 'createdForBoard':
        // case 'updatedForBoard':
        // case 'removedForBoard':
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
    } as BoardUserInviteState),
  );
  
  create(boardId: string, userInvite: CreateUserInviteDto) {
    return this.http.post<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite`, userInvite);
  }

  findAllForBoard(boardId: string) {
    setTimeout(() => this.findAllForBoard_.next({ boardId }), 0);
    return this.boardState$.pipe(
      map(state => state.data?.[boardId]?.data),
    );
  }

  findOneForBoard(boardId: string, inviteId: string) {
    return this.http.get<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`);
  }

  updateForBoard(boardId: string, inviteId: string, userInvite: UpdateUserInviteDto) {
    return this.http.patch<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`, userInvite);
  }

  removeForBoard(boardId: string, inviteId: string) {
    return this.http.delete<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`);
  }

  findAllForUser() {
    return this.http.get<UserInvite[]>(`${ this.config.apiUrl }/user-invite`);
  }

  findOneForUser(inviteId: string) {
    return this.http.get<UserInvite>(`${ this.config.apiUrl }/user-invite/${ inviteId }`);
  }

  approveForUser(inviteId: string) {
    return this.http.put<UserInvite>(`${ this.config.apiUrl }/user-invite/${ inviteId }`, {});
  }

  removeForUser(inviteId: string) {
    return this.http.delete<UserInvite>(`${ this.config.apiUrl }/user-invite/${ inviteId }`);
  }
}

type ActionFindAllForBoard = Action<'findAllForBoard', { boardId: string }>;
type ActionFindOneForBoard = Action<'findOneForBoard', { boardId: string, inviteId: string }>;
type ActionCreateForBoard = Action<'createForBoard', { boardId: string, userInvite: CreateUserInviteDto & { id: string } }>;
type ActionUpdateForBoard = Action<'updateForBoard', { boardId: string, inviteId: string, userInvite: UpdateUserInviteDto }>;
type ActionRemoveForBoard = Action<'removeForBoard', { boardId: string, inviteId: string }>;
type ActionFoundAllForBoard = Action<'foundAllForBoard', { boardId: string, userInvites: UserInvite[] }>;
type ActionFoundOneForBoard = Action<'foundOneForBoard', { boardId: string, userInvite: UserInvite }>;
type ActionCreatedForBoard = Action<'createdForBoard', { boardId: string, userInvite: UserInvite }>;
type ActionUpdatedForBoard = Action<'updatedForBoard', { boardId: string, userInvite: UserInvite }>;
type ActionRemovedForBoard = Action<'removedForBoard', { boardId: string, inviteId: string }>;

type ActionFindAllForUser = Action<'findAllForUser', {}>;
type ActionFindOneForUser = Action<'findOneForUser', { inviteId: string }>;
type ActionApproveForUser = Action<'approveForUser', { inviteId: string }>;
type ActionRemoveForUser = Action<'removeForUser', { inviteId: string }>;
type ActionFoundAllForUser = Action<'foundAllForUser', { userInvites: UserInvite[] }>;
type ActionFoundOneForUser = Action<'foundOneForUser', { userInvite: UserInvite }>;
type ActionApprovedForUser = Action<'approvedForUser', { userInvite: UserInvite }>;
type ActionRemovedForUser = Action<'removedForUser', { userInvite: UserInvite }>;

