import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, Subscription } from 'rxjs';
import { Board } from './board';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BoardService {

  private boards: { [id: Board['id']]: Board } = JSON.parse(localStorage.getItem('BOARDS_STORAGE') ?? '{}');
  private boardsSubject_ = new BehaviorSubject(this.boards);
  private boardsSub = this.boardsSubject_.subscribe(boards => {
    localStorage.setItem('BOARDS_STORAGE', JSON.stringify(boards))
  })

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

  create(board: Pick<Board, 'title'>): Observable<Board> {
    const id = uuid();
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
