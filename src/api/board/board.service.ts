import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityState } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';
import { Config } from '../config';
import { Board } from './board';
import * as BoardActions from './ngrx/board.actions';

@Injectable()
export class BoardService {

  constructor(
    private http: HttpClient,
    private config: Config,
    private store: Store<{ boards: EntityState<Board> }>,
  ) { }

  find(): Observable<Board[]> {
    this.store.dispatch(BoardActions.findAllBoards())
    return (this.store.select(state => state.boards)).pipe(
      map(state => state.entities),
      map(entities => Object.values(entities) as Board[]),
    ) 
  }

  findOne(id: Board['id']): Observable<Board> {
    this.store.dispatch(BoardActions.findOneBoard({ board: { id }}))
    return (this.store.select(state => state.boards)).pipe(
      map(state => state.entities),
      map(entities => entities[id] as Board),
    ) 
  }

  create(board: Pick<Board, 'title'>): Observable<Board> {
    this.store.dispatch(BoardActions.createBoard({ board }))
    return this.http.post<Board>(`${ this.config.apiUrl }/board`, board).pipe(
      tap(board => this.store.dispatch(BoardActions.createdBoard({ board }))),
    );
  }

  update(id: string, board: Pick<Board, 'title'>): Observable<Board> {
    this.store.dispatch(BoardActions.updateBoard({ board: { id }, update: board }))
    return this.http.patch<Board>(`${ this.config.apiUrl }/board/${ id }`, board).pipe(
      tap(board => this.store.dispatch(BoardActions.updatedBoard({ board: { id }, updated: board }))),
    );
  }

  remove(id: string): Observable<Board> {
    this.store.dispatch(BoardActions.removeBoard({ board: { id } }))
    return this.http.delete<Board>(`${ this.config.apiUrl }/board/${ id }`).pipe(
      tap(board => this.store.dispatch(BoardActions.removedBoard({ board }))),
    );
  }
}
