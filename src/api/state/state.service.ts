import { Injectable } from '@angular/core';
import { State } from './state';
import { Observable, map, BehaviorSubject, share, Subscription, tap } from 'rxjs';
import { Board } from '../board';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash-es';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';
import { EntityState } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import * as StateActions from './ngrx/state.actions';

@Injectable()
export class StateService {

  constructor(
    private http: HttpClient,
    private config: Config,
    private store: Store<{ states: EntityState<State> }>,
  ) { }

  find(boardId: Board['id']): Observable<State[]> {
    this.store.dispatch(StateActions.findAllStates({ board: { id: boardId } }))
    return this.store.select(state => state.states).pipe(
      map(state => state.entities),
      map(entities => Object.values(entities) as State[]),
      map(states => states.filter(state => state.boardId == boardId)),
      map(states => states.sort((a, b) => a.orderIndex - b.orderIndex)),
    ) 
  }

  create(boardId: Board['id'], state: Pick<State, 'title'>): Observable<State> {
    this.store.dispatch(StateActions.createState({ board: { id: boardId }, state }))
    return this.http.post<State>(`${ this.config.apiUrl }/board/${ boardId }/state`, state).pipe(
      tap(state => this.store.dispatch(StateActions.createdState({ board: { id: boardId }, state }))),
    );
  }

  update(boardId: Board['id'], id: State['id'], state: Pick<State, 'title'>): Observable<State> {
    this.store.dispatch(StateActions.updateState({ board: { id: boardId }, state: { id }, update: state }))
    return this.http.patch<State>(`${ this.config.apiUrl }/board/${ boardId }/state/${ id }`, state).pipe(
      tap(state => this.store.dispatch(StateActions.updatedState({ board: { id: boardId }, state: { id }, updated: state }))),
    );
  }

  swapStatePositions(boardId: Board['id'], aId: State['id'], bId: State['id']): Observable<State[]> {
    this.store.dispatch(StateActions.swapState({ board: { id: boardId }, aId, bId }))
    return this.http.patch<State[]>(`${ this.config.apiUrl }/board/${ boardId }/state`, {
      aId,
      bId,
    }).pipe(
      tap(states => {
        this.store.dispatch(StateActions.swappedState({ board: { id: boardId }, states }))
      }),
    );
  }

  remove(boardId: Board['id'], id: string): Observable<State> {
    this.store.dispatch(StateActions.removeState({ board: { id: boardId }, state: { id } }))
    return this.http.delete<State>(`${ this.config.apiUrl }/board/${ boardId }/state/${ id }`).pipe(
      tap(state => this.store.dispatch(StateActions.removedState({ board: { id: boardId }, state }))),
    );
  }
}
