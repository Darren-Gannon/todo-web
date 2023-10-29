import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import * as TaskActions from './task.actions';
import { Config } from '../../../config';
import { Task } from '../task';
 
@Injectable()
export class TaskEffects {
 
  loadBoards$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.findAllTasks),
    exhaustMap(({ board }) => this.http.get<Task[]>(`${ this.config.apiUrl }/board/${ board.id }/task`)
      .pipe(
        map(tasks => TaskActions.foundAllTasks({ board, tasks })),
        catchError(() => EMPTY)
      ))
    )
  );
 
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private config: Config,
  ) {}
}