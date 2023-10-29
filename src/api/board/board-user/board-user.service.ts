import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { Config } from '../../config';
import { Board } from '../board';
import { BoardUser } from './dto/board-user';

@Injectable()
export class BoardUserService {

  constructor(
    private readonly config: Config,
    private readonly http: HttpClient,
  ) { }

  private state: State = {};
  private readonly state_ = new BehaviorSubject<State>({});
  
  public findAll(boardId: string): Observable<BoardUser[]> {
    return this._findAll(boardId).pipe(
      tap(boardUsers => {
        this.state[boardId] = boardUsers.reduce((tot, boardUser) => {
          tot[boardUser.id] = boardUser;
          return tot;
        }, {} as StateItem)
        this.state_.next(this.state);
      }),
      switchMap(() => this.state_.asObservable()),
      map(state => state[boardId]),
      map(state => Object.values(state)),
    )
  }
  
  private _findAll(boardId: string) {
    return this.http.get<BoardUser[]>(`${ this.config.apiUrl }/board/${ boardId }/user`);
  }

  // TODO Add Update User
  // TODO Add Remove User
}

type State = { [boardId: Board['id']]: StateItem };

type StateItem = {
  [userId: BoardUser['id']]: BoardUser
};
