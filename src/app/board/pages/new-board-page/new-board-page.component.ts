import { Component } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, delay, filter, map, of, switchMap, tap } from 'rxjs';
import { BoardService, StateService, User } from '../../../../api';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-new-board-page',
  templateUrl: './new-board-page.component.html',
  styleUrls: ['./new-board-page.component.scss']
})
export class NewBoardPageComponent {

  public readonly boardForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.minLength(3), Validators.required] }),
    users: this.fb.array<User>([]),
  });

  public readonly submitBoardEmitter = new Subject<Partial<{ 
    title: string;
    states: (string | null)[];
    users: (User | null)[];
  }>>();
  public readonly submitBoard$ = this.submitBoardEmitter.asObservable().pipe(
    filter(form => !!form.title),
    tap(() => this.submitBoardStateEmitter.next('validating')),
    delay(500),
    map(form => ({
      title: form.title!,
      states: form.states?.filter(state => !!state) as string[],
      users: form.users?.filter(user => !!user) as User[],
    })),
    tap(() => this.submitBoardStateEmitter.next('creating-board')),
    switchMap(form => this.boardService.create({ title: form.title })),
    tap(() => this.submitBoardStateEmitter.next('done')),
    delay(1500),
    switchMap(board => {
      return this.authService.getAccessTokenSilently().pipe(
        map(() => board),
      );
    }),
    switchMap(board => this.authService.loginWithRedirect({
      appState: {
        target: `app/board/${ board.id }`,
      }
    })),
  );
  
  public submitBoardStateEmitter = new Subject<'validating' | 'creating-board' | 'creating-states' | 'done'>();
  public readonly submitBoardState$ = this.submitBoardStateEmitter.asObservable();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly boardService: BoardService,
    private readonly authService: AuthService,
  ) { }
}