import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, shareReplay } from 'rxjs';
import { Board, BoardService, State, StateService } from '../../../../api';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-settings-page',
  templateUrl: './board-settings-page.component.html',
  styleUrls: ['./board-settings-page.component.scss']
})
export class BoardSettingsPageComponent {

  private readonly boardId$ = this.route.paramMap.pipe(
    map(params => params.get('boardId')!),
  );
  
  public readonly board$ = this.boardId$.pipe(
    switchMap(boardId => this.boardService.findOne(boardId)),
    shareReplay(1),
  );

  public readonly states$ = this.boardId$.pipe(
    switchMap(boardId => this.stateService.find(boardId)),
    shareReplay(1),
  );

  deleteBoard(board: Board) {
    if(!confirm('are you sure you want to delete this board')) return;
    this.boardService.remove(board.id).pipe(
      switchMap(board => this.router.navigate(['../..'], { relativeTo: this.route }))
    ).subscribe();
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly boardService: BoardService,
    private readonly stateService: StateService,
  ) { }

  drop(event: CdkDragDrop<State>, states: State[], board: Board) {
    this.stateService.swapStatePositions(board.id, states[event.previousIndex].id, states[event.currentIndex].id).subscribe()
  }
}
