import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BoardService } from '../../../api';

@Component({
  selector: 'app-app-page',
  templateUrl: './app-page.component.html',
  styleUrls: ['./app-page.component.scss']
})
export class AppPageComponent {

  public boards$ = this.boardService.find();

  constructor(
    public readonly authService: AuthService,
    public readonly boardService: BoardService,
  ) { }
}
