import { Injectable } from '@angular/core';
import { Observable, of, map, BehaviorSubject, share, Subscription, tap } from 'rxjs';
import { Task } from './task';
import { Board } from '../board';
import { v4 as uuid } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';
import { Store } from '@ngrx/store';
import { EntityState } from '@ngrx/entity';
import * as TaskActions from './ngrx/task.actions';

@Injectable()
export class TaskService {

  private tasks: { [id: Board['id']]: {[id: Task['id']]: Task} } = JSON.parse(localStorage.getItem('TASK_STORAGE') ?? '{}');
  private tasksSubject_ = new BehaviorSubject(this.tasks);
  private tasksSub: Subscription = this.tasksSubject_.subscribe(tasks => {
    localStorage.setItem('TASK_STORAGE', JSON.stringify(tasks))
  });

  constructor(
    private http: HttpClient,
    private config: Config,
    private store: Store<{ tasks: EntityState<Task> }>,
  ) { }

  find(boardId: Board['id']): Observable<Task[]> {
    this.store.dispatch(TaskActions.findAllTasks({ board: { id: boardId }}))
    return this.store.select(state => state.tasks).pipe(
      map(state => state.entities),
      map(entities => Object.values(entities) as Task[]),
      map(tasks => tasks.filter(state => state.boardId == boardId)),
    ) 
  }

  create(boardId: Board['id'], task: Pick<Task, 'title' | 'description' | 'stateId'>): Observable<Task> {
    this.store.dispatch(TaskActions.createTask({ board: { id: boardId }, task }))
    return this.http.post<Task>(`${ this.config.apiUrl }/board/${ boardId }/task`, task).pipe(
      tap(task => this.store.dispatch(TaskActions.createdTask({ board: { id: boardId }, task }))),
    );
  }

  update(boardId: Board['id'], id: string, task: Pick<Task, 'title' | 'description' | 'stateId'>): Observable<Task> {
    this.store.dispatch(TaskActions.updateTask({ board: { id: boardId }, task: { id }, update: task }))
    return this.http.patch<Task>(`${ this.config.apiUrl }/board/${ boardId }/task/${ id }`, task).pipe(
      tap(task => this.store.dispatch(TaskActions.updatedTask({ board: { id: boardId }, task: { id }, updated: task }))),
    );
  }

  remove(boardId: Board['id'], id: string): Observable<Task> {
    this.store.dispatch(TaskActions.removeTask({ board: { id: boardId }, task: { id } }))
    return this.http.delete<Task>(`${ this.config.apiUrl }/board/${ boardId }/task/${ id }`).pipe(
      tap(task => this.store.dispatch(TaskActions.removedTask({ board: { id: boardId }, task }))),
    );
  }
}
