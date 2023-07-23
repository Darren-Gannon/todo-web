import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import * as BoardActions from './board.actions';
import { Board } from '../board';
import { Config } from '../../config';
 
@Injectable()
export class BoardEffects {
 
  loadBoards$ = createEffect(() => this.actions$.pipe(
    ofType(BoardActions.findAllBoards),
    exhaustMap(() => this.http.get<Board[]>(`${ this.config.apiUrl }/board`)
      .pipe(
        map(boards => BoardActions.foundAllBoards({ boards })),
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