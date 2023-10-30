import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject, Subscription, filter, map, mergeMap, share, switchMap, tap, throwError } from 'rxjs';
import { Board, BoardService, State, StateService, Task, TaskService } from '../../../../api';
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
    share(),
  );

  public readonly tasks$ =  this.boardId$.pipe(
    switchMap(boardId => this.taskService.find(boardId)),
  );

  public readonly states$ = this.boardId$.pipe(
    switchMap(boardId => this.stateService.find(boardId)),
  ).pipe(
    map((states) => {
      const ret = {
        ...states,
        data: Object.values(states.data ?? {}).map(state => ({
          ...state,
          data: {
            ...state.data!,
            tasks$: this.tasks$.pipe(
              map(tasks => tasks.filter(task => task.stateId == state.data?.id))
            ),
          },
        }))
      };
      return ret;
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

  private updateCreateStatusSub?: Subscription;
  private boardSub?: Subscription;
  ngOnInit(): void {
    this.boardSub = this.board$.subscribe(board => {
      if(board?.loaded)
        this.boardForm.patchValue({
          title: board?.data?.title,
        });
    });
  }

  ngOnDestroy(): void {
    this.updateCreateStatusSub?.unsubscribe();
    this.boardSub?.unsubscribe();
  }

  createTask(board: Board, state: State, states: { data: State }[]): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: {
        states: states,
        state: state,
      }
    });

    dialogRef.afterClosed().pipe(
      mergeMap((result: TaskDialogResult) => {
        if(result?.action == 'submit') {
          return this.taskService.create(board.id, result.task);
        }
        return EMPTY;
      }),
    ).subscribe();
  }

  openTask(board: Board, state: State, states: { data: State }[], task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: {
        states: states,
        state: state,
        task: task,
      }
    });

    dialogRef.afterClosed().pipe(
      mergeMap((result: TaskDialogResult) => {
        if(result?.action == 'submit') {
          return this.taskService.update(board.id, task.id, result.task);
        }
        return EMPTY;
      }),
    ).subscribe();
  }
}
