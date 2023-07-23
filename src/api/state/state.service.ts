import { Injectable } from '@angular/core';
import { State } from './state';
import { Observable, map, BehaviorSubject, share, Subscription } from 'rxjs';
import { Board } from '../board';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash-es';

@Injectable()
export class StateService {

  constructor() { }

  private states: { [id: Board['id']]: {[id: State['id']]: State} } = JSON.parse(localStorage.getItem('STATES_STORAGE') ?? '{}');
  private statesSubject_ = new BehaviorSubject(this.states);
  private readonly statesSub = this.statesSubject_.subscribe(states => {
    localStorage.setItem('STATES_STORAGE', JSON.stringify(states))
  })

  find(boardId: Board['id']): Observable<State[]> {
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId] ? Object.values(statesMap[boardId]) ?? [] : []),
      map(states => states.sort((a, b) => a.orderIndex - b.orderIndex)),
      share(),
    );
  }

  create(boardId: Board['id'], state: Pick<State, 'title'>): Observable<State> {
    const id = uuid();
    if(!this.states[boardId])
      this.states[boardId] = {};
    this.states[boardId][id] = {
      ...state,
      id,
      orderIndex: Object.keys(this.states[boardId]).length,
    }
    this.statesSubject_.next(this.states);
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId][id]),
      share(),
    );
  }

  update(boardId: Board['id'], id: State['id'], state: Pick<State, 'title'>): Observable<State> {
    this.states[boardId][id] = {
      ...this.states[boardId][id],
      ...state,
    };
    this.statesSubject_.next(this.states);
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId][id]),
      share(),
    );
  }

  swapStatePositions(boardId: Board['id'], aId: State['id'], bId: State['id']): Observable<[State, State]> {
    const states = Object.values(this.states[boardId]);
    const aIndex = states.findIndex(state => state.id == aId);
    const bIndex = states.findIndex(state => state.id == bId);
    const minIndex = Math.min(aIndex, bIndex);
    const maxIndex = Math.max(aIndex, bIndex);
    const leading = states.slice(0, minIndex);
    const mid = states.slice(minIndex, maxIndex+1);
    const trailing = states.slice(maxIndex+1);
    const val = mid.shift();
    const midMod = mid.map(item => {
      item.orderIndex--
      return item;
    });
    if(val)
      val.orderIndex = midMod[midMod.length - 1].orderIndex + 1;
    midMod.push(val!);
    const arr = [...leading, ...midMod, ...trailing];
    this.states[boardId] = arr.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {} as any);
    
    this.statesSubject_.next(this.states);
    return this.statesSubject_.pipe(
      map(statesMap => [statesMap[boardId][aId], statesMap[boardId][bId]] satisfies [State, State]),
      share(),
    );
  }

  remove(boardId: Board['id'], id: string): Observable<State> {
    delete this.states[boardId][id];
    this.statesSubject_.next(this.states);
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId][id]),
      share(),
    );
  }
}
