import { Component } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, delay, filter, map, of, switchMap, tap } from 'rxjs';
import { BoardService, StateService, User } from '../../../../api';

@Component({
  selector: 'app-new-board-page',
  templateUrl: './new-board-page.component.html',
  styleUrls: ['./new-board-page.component.scss']
})
export class NewBoardPageComponent {

  public readonly boardForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.minLength(3), Validators.required] }),
    states: this.fb.array<string>([]),
    users: this.fb.array<User>([]),
  });

  public readonly newStateCtrl = this.fb.control<string>(undefined!, { nonNullable: true, validators: [Validators.minLength(3), Validators.required] });

  public get states() {
    return this.boardForm.get('states') as FormArray;
  }

  public readonly addStateEmitter = new Subject<void>();
  public readonly addState$ = this.addStateEmitter.asObservable().pipe(
    map(() => {
      let ctrl = this.fb.control<string>(undefined!, { nonNullable: true, validators: [Validators.minLength(3)] });
      this.states.push(ctrl);
      ctrl.reset();
    })
  );

  public readonly removeStateEmitter = new Subject<number>();
  public readonly removeState$ = this.removeStateEmitter.asObservable().pipe(
    map(index => {
      this.states.removeAt(index);
    })
  );

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
    switchMap(form => {
      return combineLatest([this.boardService.create({ title: form.title }), of(form)])
    }),
    tap(() => this.submitBoardStateEmitter.next('creating-states')),
    switchMap(([board, form]) => combineLatest([
      of(board),
      this.stateService.createMany(board.id, form.states.map(stateName => ({
        title: stateName
      }))),
    ])),
    tap(() => this.submitBoardStateEmitter.next('done')),
    delay(1500),
    switchMap(([board]) => this.router.navigate(['..', board.id], { relativeTo: this.route })),
  );
  
  public submitBoardStateEmitter = new Subject<'validating' | 'creating-board' | 'creating-states' | 'done'>();
  public readonly submitBoardState$ = this.submitBoardStateEmitter.asObservable();
  public readonly submitBoardStatePerc$ = this.submitBoardState$.pipe(
    map(state => {
      switch(state) {
        case 'validating': 
          return 1;
        case 'creating-board': 
          return 33;
        case 'creating-states': 
          return 67;
        case 'done': 
          return 100;
        default: 
          return 0;
      }
    })
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly boardService: BoardService,
    private readonly stateService: StateService,
  ) { }
}