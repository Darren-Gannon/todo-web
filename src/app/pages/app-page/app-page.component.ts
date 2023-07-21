import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BoardService } from '../../../api';

@Component({
  selector: 'app-app-page',
  templateUrl: './app-page.component.html',
  styleUrls: ['./app-page.component.scss']
})
export class AppPageComponent {

  constructor(
    public readonly authService: AuthService,
    public readonly boardService: BoardService,
  ) { }
}
