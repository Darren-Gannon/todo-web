import { Component } from '@angular/core';
import { BoardService } from '@api';
import { delay } from 'rxjs';

@Component({
  selector: 'app-board-list-page',
  templateUrl: './board-list-page.component.html',
  styleUrls: ['./board-list-page.component.scss']
})
export class BoardListPageComponent {

  public readonly boards$ = this.boardService.find();

  constructor(
    private boardService: BoardService,
  ) {}
}
