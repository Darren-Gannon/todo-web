import { Injectable } from '@angular/core';
import { State } from './state';
import { Observable, map, BehaviorSubject, share } from 'rxjs';
import { Board } from '../board';

const TASKS: State[] = [
  {
    id: '1',
    title: 'To Do',
  },
  {
    id: '2',
    title: 'Done',
  },
];

@Injectable()
export class StateService {

  constructor() { }

  private states: { [id: Board['id']]: {[id: State['id']]: State} } = {
  };
  private statesSubject_ = new BehaviorSubject(this.states);

  find(boardId: Board['id']): Observable<State[]> {
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId] ? Object.values(statesMap[boardId]) ?? [] : []),
      share(),
    );
  }

  statesCounter = 2;
  create(boardId: Board['id'], state: Pick<State, 'title'>): Observable<State> {
    const id = `${ ++this.statesCounter }`;
    if(!this.states[boardId])
      this.states[boardId] = {};
    this.states[boardId][id] = {
      ...state,
      id,
    }
    this.statesSubject_.next(this.states);
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId][id]),
      share(),
    );
  }

  update(boardId: Board['id'], id: string, state: Pick<State, 'title'>): Observable<State> {
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

  remove(boardId: Board['id'], id: string): Observable<State> {
    delete this.states[boardId][id];
    this.statesSubject_.next(this.states);
    return this.statesSubject_.pipe(
      map(statesMap => statesMap[boardId][id]),
      share(),
    );
  }
}
