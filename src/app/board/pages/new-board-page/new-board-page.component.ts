import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { BoardService } from '../../../../api';

@Component({
  selector: 'app-new-board-page',
  templateUrl: './new-board-page.component.html',
  styleUrls: ['./new-board-page.component.scss']
})
export class NewBoardPageComponent {

  public readonly boardForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.minLength(3), Validators.required] })
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private boardService: BoardService,
  ) { }

  createBoard(formValue: Partial<BoardFormValue>) {
    this.boardService.create({ title: formValue.title! }).pipe(
      switchMap(board => this.router.navigate(['..', board.id], { relativeTo: this.route }))
    ).subscribe();
  }
}

interface BoardFormValue {
  title: string;
}