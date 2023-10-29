import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';
import { Config } from '../config';
import { Board } from './board';
import * as BoardActions from './ngrx/board.actions';
import { BoardState } from './ngrx/board.state';
import { CachedResult } from '../cache-result';

@Injectable()
export class BoardService {

  constructor(
    private http: HttpClient,
    private config: Config,
    private store: Store<{ boards: BoardState }>,
  ) { }

  find(): Observable<CachedResult<CachedResult<Board>[]>> {
    this.store.dispatch(BoardActions.findAllBoards())
    return (this.store.select(state => state.boards)).pipe(
      map(boardState => ({ stale: boardState.stale, data: [...boardState.data.values()] })),
    ) 
  }

  findOne(id: Board['id']): Observable<CachedResult<Board> | undefined> {
    this.store.dispatch(BoardActions.findOneBoard({ board: { id }}))
    return (this.store.select(state => state.boards)).pipe(
      map(state => state.data.get(id)),
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
