import { Injectable } from '@angular/core';
import { State } from './state';
import { Observable, map, BehaviorSubject, share, Subscription, tap } from 'rxjs';
import { Board } from '../board';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash-es';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';

@Injectable()
export class StateService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }

  private states: { [id: Board['id']]: {[id: State['id']]: State} } = JSON.parse(localStorage.getItem('STATES_STORAGE') ?? '{}');
  private statesSubject_ = new BehaviorSubject(this.states);
  private readonly statesSub = this.statesSubject_.subscribe(states => {
    localStorage.setItem('STATES_STORAGE', JSON.stringify(states))
  })

  find(boardId: Board['id']): Observable<State[]> {
    this.http.get<State[]>(`${ this.config.apiUrl }/board/${ boardId }/state`).subscribe(states => {
      if(!this.states) this.states = {};
      if(!this.states[boardId]) this.states[boardId] = {};
      const statesMap = states.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as any)
      this.states[boardId] = statesMap;
      this.statesSubject_.next(this.states);
    })
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId] ? Object.values(statesMap[boardId]) ?? [] : []),
      map(states => states.sort((a, b) => a.orderIndex - b.orderIndex)),
      share(),
    );
  }

  create(boardId: Board['id'], state: Pick<State, 'title'>): Observable<State> {
    return this.http.post<State>(`${ this.config.apiUrl }/board/${ boardId }/state`, state).pipe(
      tap(state => {
        if(!this.states) this.states = {};
        if(!this.states[boardId]) this.states[boardId] = {};
        this.states[boardId][state.id] = state;
        this.statesSubject_.next(this.states);
      }),
    );
  }

  update(boardId: Board['id'], id: State['id'], state: Pick<State, 'title'>): Observable<State> {
    return this.http.patch<State>(`${ this.config.apiUrl }/board/${ boardId }/state/${ id }`, state).pipe(
      tap(state => {
        if(!this.states) this.states = {};
        if(!this.states[boardId]) this.states[boardId] = {};
        this.states[boardId][state.id] = state;
        this.statesSubject_.next(this.states);
      }),
    );
  }

  swapStatePositions(boardId: Board['id'], aId: State['id'], bId: State['id']): Observable<State[]> {
    return this.http.patch<State[]>(`${ this.config.apiUrl }/board/${ boardId }/state`, {
      aId,
      bId,
    }).pipe(
      tap(states => {
        if(!this.states) this.states = {};
        if(!this.states[boardId]) this.states[boardId] = {};
        const statesMap = states.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as any)
        this.states[boardId] = statesMap;
        this.statesSubject_.next(this.states);
      }),
    );
  }

  remove(boardId: Board['id'], id: string): Observable<State> {
    return this.http.delete<State>(`${ this.config.apiUrl }/board//${ boardId }/state/${ id }`).pipe(
      tap(state => {
        delete this.states[boardId][id];
        this.statesSubject_.next(this.states);
      }),
    );
  }
}
