import { Component } from '@angular/core';
import { BoardService } from '@api';
import { delay } from 'rxjs';

@Component({
  selector: 'app-board-list-page',
  templateUrl: './board-list-page.component.html',
  styleUrls: ['./board-list-page.component.scss']
})
export class BoardListPageComponent {

  public boards$ = this.boardService.find().pipe(
    delay(200),
  );

  constructor(
    private boardService: BoardService,
  ) {}
}
