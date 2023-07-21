import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Board } from './board';

@Injectable()
export class BoardService {

  private boards: { [id: Board['id']]: Board } = {
  };
  private boardsSubject_ = new BehaviorSubject(this.boards);

  constructor() { }

  find(): Observable<Board[]> {
    return this.boardsSubject_.pipe(
      map(boardsMap => Object.values(boardsMap))
    );
  }

  findOne(id: Board['id']): Observable<Board> {
    return this.boardsSubject_.pipe(
      map(boardsMap => boardsMap[id])
    );
  }

  boardCounter = 1;
  create(board: Pick<Board, 'title'>): Observable<Board> {
    const id = `${ ++this.boardCounter }`;
    this.boards[id] = {
      ...board,
      id,
    }
    this.boardsSubject_.next(this.boards);
    return this.boardsSubject_.pipe(
      map(boardsMap => boardsMap[id])
    );
  }

  update(id: string, board: Pick<Board, 'title'>): Observable<Board> {
    this.boards[id] = {
      ...this.boards[id],
      ...board,
    };
    this.boardsSubject_.next(this.boards);
    return this.boardsSubject_.pipe(
      map(boardsMap => boardsMap[id])
    );
  }

  remove(id: string): Observable<Board> {
    delete this.boards[id];
    this.boardsSubject_.next(this.boards);
    return this.boardsSubject_.pipe(
      map(boardsMap => boardsMap[id])
    );
  }
}
