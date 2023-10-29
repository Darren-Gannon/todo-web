import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, filter, map, share, shareReplay, startWith, switchMap } from 'rxjs';
import { Board, BoardService, BoardUserService, State, StateService, UserRole, UserService } from '../../../../api';
import { UserInviteService } from '../../../../api/board/user-invite/user-invite.service';
import { UserInvite } from '../../../../api/board/user-invite/dto/user-invite.dto';

@Component({
  selector: 'app-board-settings-page',
  templateUrl: './board-settings-page.component.html',
  styleUrls: ['./board-settings-page.component.scss']
})
export class BoardSettingsPageComponent {

  public readonly UserRole = UserRole;

  public readonly newStateTitle = this.fb.control(undefined!, { nonNullable: true, validators: [Validators.minLength(3), Validators.required] });

  public readonly inviteUserForm = this.fb.group({
    email: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    role: this.fb.control<UserRole>(UserRole.SPECTATOR, { nonNullable: true, validators: [Validators.required] }),
  });

  private readonly boardId$ = this.route.paramMap.pipe(
    map(params => params.get('boardId')!),
  );

  public readonly boardUsers$ = this.boardId$.pipe(
    switchMap(boardId => this.boardUserService.findAll(boardId)),
    share(),
  );

  public readonly users$ = combineLatest([
    this.boardUsers$,
    this.userService.findAll(),
  ]).pipe(
    map(([boardUsers, users]) => {
      const boardUsersIds = boardUsers.map(({ userId }) => userId);
      return users.filter(user => !boardUsersIds.includes(user.user_id));
    }),
    shareReplay(1),
  );

  public readonly filteredInviteUsers$ = combineLatest([
    this.users$,
    this.inviteUserForm.controls.email.valueChanges.pipe(
      startWith(this.inviteUserForm.controls.email.value),
    ),
  ]).pipe(
    filter(val => this.inviteUserForm.controls.email.valid),
    map(([users, email]) => users.filter(user => user.email.includes(email))),
  );
    
  public readonly board$ = this.boardId$.pipe(
    switchMap(boardId => this.boardService.findOne(boardId)),
    share(),
  );
  
  public readonly boardTitleCtrl$ = this.board$.pipe(
    map(board => this.fb.control(board?.data!.title!, { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }))
  );

  public readonly states$ = this.boardId$.pipe(
    switchMap(boardId => this.stateService.find(boardId)),
    share(),
  );

  public readonly statesCtrls$ = this.states$.pipe(
    map(states => states.data),
    map(states => states.map(state => state.data).map(state => this.fb.control(state.title, { nonNullable: true, validators: [Validators.minLength(3), Validators.required] }))),
    startWith([]),
  );

  public readonly userInvites$ = this.boardId$.pipe(
    switchMap(id => this.userInviteService.findAllForBoard(id)),
  );

  public readonly inviteUserEmitter = new Subject<{
    userForm: Partial<{ email: string; role: UserRole; }>,
    board: Board,
  }>();
  public readonly inviteUser$ = this.inviteUserEmitter.asObservable().pipe(
    switchMap(({ userForm, board }) => this.userInviteService.create(board.id, {
      role: userForm.role!,
      email: userForm.email!,
    }))
  );

  editBoard(board: Board, update: Pick<Board, 'title'>) {
    return this.boardService.update(board.id, update).subscribe();
  }

  deleteBoard(board: Board) {
    if(!confirm('are you sure you want to delete this board')) return;
    this.boardService.remove(board.id).pipe(
      switchMap(board => this.router.navigate(['../..'], { relativeTo: this.route }))
    ).subscribe();
  }

  deleteState(board: Board, state: State) {
    if(!confirm('are you sure you want to delete this state')) return;
    this.stateService.remove(board.id, state.id).subscribe();
  }

  createState(board: Board, state: Pick<State, "title">) {
    return this.stateService.create(board.id, state).subscribe();
  }

  editState(board: Board, original: State, state: Pick<State, "title">) {
    return this.stateService.update(board.id, original.id, state).subscribe();
  }

  updateInviteRole(board: Board, invite: UserInvite, role: UserRole) {
    this.userInviteService.updateForBoard(board.id, invite.id, {
      role: role,
    }).subscribe()
  }

  deleteInvite(board: Board, invite: UserInvite) {
    this.userInviteService.removeForBoard(board.id, invite.id).subscribe()
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly boardService: BoardService,
    private readonly stateService: StateService,
    private readonly fb: FormBuilder,
    private readonly boardUserService: BoardUserService,
    private readonly userService: UserService,
    private readonly userInviteService: UserInviteService,
  ) { }
}
