import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject, Subscription, map, mergeMap, switchMap, tap, throwError } from 'rxjs';
import { Board, BoardService, State, StateService, Task, TaskService } from '../../../../api';
import { CachedResult } from '../../../../api/cache-result';
import { TaskDialogComponent, TaskDialogResult } from './task-dialog/task-dialog.component';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.scss']
})
export class BoardPageComponent implements OnInit, OnDestroy {

  public readonly boardForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] })
  })

  private readonly boardId$ = this.route.paramMap.pipe(
    map(params => params.get('boardId')!),
  );

  public readonly board$ = this.boardId$.pipe(
    switchMap(boardId => this.boardService.findOne(boardId)),
  );

  public readonly states$ = this.boardId$.pipe(
    switchMap(boardId => this.stateService.find(boardId)),
  ).pipe(
    map((states) => {
      const ret = {
        ...states,
        data: states.data.map(state => ({
          ...state,
          data: {
            ...state.data,
            tasks$: this.boardId$.pipe(
              switchMap(boardId => this.taskService.find(boardId)),
              map(tasks => tasks.filter(task => task.stateId == state.data.id))
            ),
          },
        }))
      };
      return ret;
    }),
  );

  public readonly openTask_ = new Subject<{ board: Board, task?: Task, states: CachedResult<State>[], state: State }>();
  private readonly openTask$ = this.openTask_.pipe();
  private readonly updateCreateTask$ = this.openTask$.pipe(
    switchMap(({ task: original, states, board, state }) => this.dialog.open(TaskDialogComponent, {
      data: { task: original, states, state },
    }).afterClosed().pipe(
      map((update?: TaskDialogResult) => ({ original, update, board }))
    ),
    )).pipe(
      mergeMap(({ original, update, board }) => {
        if (!update)
          return EMPTY; // No update given just ignore
        else if (update.action == 'delete') {
          if (!original) // Request to delete nothing, user wanted to created new task, but clicked delete
            return EMPTY;
          return this.taskService.remove(board.id, original.id);
        } else if (update.action == 'submit') {
          if (!original)
            return this.taskService.create(board.id, update.task);
          return this.taskService.update(board.id, original.id, update.task);
        }
        return throwError(() => new Error('Unrecognized action')); // Unrecognised action
      }),
    );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly boardService: BoardService,
    private readonly stateService: StateService,
    private readonly taskService: TaskService,
    private readonly fb: FormBuilder,
  ) { }

  private updateCreateTaskSub?: Subscription;
  private updateCreateStatusSub?: Subscription;
  private boardSub?: Subscription;
  ngOnInit(): void {
    this.boardSub = this.board$.subscribe(board => this.boardForm.patchValue({
      title: board?.data?.title,
    }));
    this.updateCreateTaskSub = this.updateCreateTask$.subscribe();
  }

  ngOnDestroy(): void {
    this.updateCreateTaskSub?.unsubscribe();
    this.updateCreateStatusSub?.unsubscribe();
    this.boardSub?.unsubscribe();
  }
}
