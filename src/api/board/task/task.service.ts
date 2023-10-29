import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';
import { Board } from '../board';
import { Config } from '../../config';
import * as TaskActions from './ngrx/task.actions';
import { TaskState } from './ngrx/task.state';
import { Task } from './task';

@Injectable()
export class TaskService {

  constructor(
    private http: HttpClient,
    private config: Config,
    private store: Store<{ tasks: TaskState }>,
  ) { }

  find(boardId: Board['id']): Observable<Task[]> {
    this.store.dispatch(TaskActions.findAllTasks({ board: { id: boardId }}))
    return this.store.select(state => state.tasks.data).pipe(
      map(data => [...data.values()]),
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
