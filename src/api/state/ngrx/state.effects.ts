import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import * as StateActions from './state.actions';
import { Config } from '../../config';
import { State } from '../state';
 
@Injectable()
export class StatesEffects {
 
  loadBoards$ = createEffect(() => this.actions$.pipe(
    ofType(StateActions.findAllStates),
    exhaustMap(({ board }) => this.http.get<State[]>(`${ this.config.apiUrl }/board/${ board.id }/state`)
      .pipe(
        map(states => StateActions.foundAllStates({ board, states })),
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