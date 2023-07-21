import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, ReplaySubject, Subscription, combineLatest, of, repeat, map, mergeMap, share, shareReplay, switchMap, tap, zip } from 'rxjs';
import { Board, BoardService, State, StateService } from '../../../../api';
import { Task, TaskService } from '../../../../api/task';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { StateDialogComponent } from './state-dialog/state-dialog.component';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.scss']
})
export class BoardPageComponent implements OnInit, OnDestroy {

  public readonly boardForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3) ]})
  })

  private readonly boardId$ = this.route.paramMap.pipe(
    map(params => params.get('boardId')!),
  );
  
  public readonly board$ = this.boardId$.pipe(
    switchMap(boardId => this.boardsService.findOne(boardId)),
    shareReplay(1),
  );
  
  public readonly states$ = 
    this.boardId$.pipe(
      switchMap(boardId => this.stateService.find(boardId)),
    ).pipe(
    map((states) => states.map(state => ({ 
      ...state,
      tasks$: this.boardId$.pipe(
        switchMap(boardId => this.taskService.find(boardId)),
        map(tasks => tasks.filter(task => task.stateId == state.id))
      )
    }))),
  );

  public readonly openState_ = new ReplaySubject<{ state?: State }>(1);
  private readonly openState$ = this.openState_.pipe(
    repeat(),
  );
  private readonly updateCreateStatus$ = combineLatest([
    this.boardId$,
    this.openState$.pipe(
      mergeMap(({ state }) => zip([
        of(state),
        this.dialog.open(StateDialogComponent, {
          data: {
            state,
          },
          panelClass: ['col-xs-10', 'col-sm-6', 'col-md-4'],
          height: 'auto',
        }).afterClosed()
      ]),
    )),
  ]).pipe(
    tap(val => console.log(val)),
    switchMap(([boardId, state]) => {
      const [original, update] = state;
      if(!update) return EMPTY;
      if(!original)
        return this.stateService.create(boardId, update);
      return this.stateService.update(boardId, original?.id, update);
    })
  );
  public readonly openTask_ = new ReplaySubject<{ task?: Task, states: State[] }>(1);
  private readonly openTask$ = this.openTask_.pipe(
    share(),
  );
  private readonly updateCreateTask$ = combineLatest([
    this.boardId$,
    this.openTask$,
    this.openTask$.pipe(
      mergeMap(({ task, states }) => this.dialog.open(TaskDialogComponent, {
        data: {
          task,
          states,
        }
      }).afterClosed(),
    )),
  ]).pipe(
    mergeMap(([boardId, original, update]) => {
      if(!update) return EMPTY;
      if(!original.task)
        return this.taskService.create(boardId, update);
      return this.taskService.update(boardId, original.task.id, update);
    }),
  );

  public readonly updateBoard_ = new ReplaySubject<Partial<Board>>(1);
  private updateBoard$ = combineLatest([
    this.board$,
    this.updateBoard_,
  ]).pipe(
    switchMap(([original, update]) => this.boardsService.update(original.id, { title: update.title! }))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly boardsService: BoardService,
    private readonly stateService: StateService,
    private readonly taskService: TaskService,
    private readonly fb: FormBuilder,
  ) { }

  private updateCreateTaskSub?: Subscription;
  private updateCreateStatusSub?: Subscription;
  private boardSub?: Subscription;
  private updateBoardSub?: Subscription;
  ngOnInit(): void {
    this.boardSub = this.board$.subscribe(board => this.boardForm.patchValue({
      title: board?.title,
    }));
    this.updateCreateTaskSub = this.updateCreateTask$.subscribe();
    this.updateCreateStatusSub = this.updateCreateStatus$.subscribe();
    this.updateBoardSub = this.updateBoard$.subscribe();
  }

  ngOnDestroy(): void {
    this.updateCreateTaskSub?.unsubscribe();
    this.updateCreateStatusSub?.unsubscribe();
    this.boardSub?.unsubscribe();
    this.updateBoardSub?.unsubscribe();
  }
}
