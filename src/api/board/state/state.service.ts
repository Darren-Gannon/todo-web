import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';
import { Board } from '../board';
import { Config } from '../../config';
import * as StateActions from './ngrx/state.actions';
import { StateState } from './ngrx/state.state';
import { State } from './state';
import { CachedResult } from '../../cache-result';

@Injectable()
export class StateService {

  constructor(
    private http: HttpClient,
    private config: Config,
    private store: Store<{ states: StateState }>,
  ) { }

  find(boardId: Board['id']): Observable<CachedResult<CachedResult<State>[]>> {
    this.store.dispatch(StateActions.findAllStates({ board: { id: boardId } }))
    return this.store.select(state => state.states).pipe(
      map(state => ({
        stale: state.stale,
        data: [...state.data.values()].filter(state => state.data.boardId == boardId).sort((a, b) => a.data.orderIndex - b.data.orderIndex),
      })),
    ) 
  }

  create(boardId: Board['id'], state: Pick<State, 'title'>): Observable<State> {
    this.store.dispatch(StateActions.createState({ board: { id: boardId }, state }))
    return this.http.post<State>(`${ this.config.apiUrl }/board/${ boardId }/state`, state).pipe(
      tap(state => this.store.dispatch(StateActions.createdState({ board: { id: boardId }, state }))),
    );
  }

  createMany(boardId: Board['id'], states: Pick<State, 'title'>[]): Observable<State[]> {
    this.store.dispatch(StateActions.createManyState({ board: { id: boardId }, states }))
    return this.http.post<State[]>(`${ this.config.apiUrl }/board/${ boardId }/state/many`, states).pipe(
      tap(states => this.store.dispatch(StateActions.createdManyState({ board: { id: boardId }, states }))),
    );
  }

  update(boardId: Board['id'], id: State['id'], state: Pick<State, 'title'>): Observable<State> {
    this.store.dispatch(StateActions.updateState({ board: { id: boardId }, state: { id }, update: state }))
    return this.http.patch<State>(`${ this.config.apiUrl }/board/${ boardId }/state/${ id }`, state).pipe(
      tap(state => this.store.dispatch(StateActions.updatedState({ board: { id: boardId }, state: { id }, updated: state }))),
    );
  }

  remove(boardId: Board['id'], id: State['id']): Observable<State> {
    this.store.dispatch(StateActions.removeState({ board: { id: boardId }, state: { id } }))
    return this.http.delete<State>(`${ this.config.apiUrl }/board/${ boardId }/state/${ id }`).pipe(
      tap(state => this.store.dispatch(StateActions.removedState({ board: { id: boardId }, state }))),
    );
  }
}
