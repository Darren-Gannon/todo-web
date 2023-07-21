import { Injectable } from '@angular/core';
import { Observable, of, map, BehaviorSubject, share, Subscription } from 'rxjs';
import { Task } from './task';
import { Board } from '../board';

@Injectable()
export class TaskService {

  private tasks: { [id: Board['id']]: {[id: Task['id']]: Task} } = JSON.parse(localStorage.getItem('TASK_STORAGE') ?? '{}');
  private tasksSubject_ = new BehaviorSubject(this.tasks);
  private tasksSub: Subscription = this.tasksSubject_.subscribe(tasks => {
    localStorage.setItem('TASK_STORAGE', JSON.stringify(tasks))
  });

  constructor() { }

  find(boardId: Board['id']): Observable<Task[]> {
    return this.tasksSubject_.pipe(
      map(tasksMap => tasksMap[boardId] ? Object.values(tasksMap[boardId]) ?? [] : []),
      share(),
    );
  }

  tasksCounter = Object.values(this.tasks).map(tasksList => Object.values(tasksList)).reduce((total, curr) => total + curr.length, 0);
  create(boardId: Board['id'], task: Pick<Task, 'title' | 'description' | 'stateId'>): Observable<Task> {
    const id = `${ ++this.tasksCounter }`;
    if(!this.tasks[boardId])
      this.tasks[boardId] = {};
    this.tasks[boardId][id] = {
      ...task,
      id,
      createdAt: new Date().toISOString(),
    }
    this.tasksSubject_.next(this.tasks);
    return this.tasksSubject_.pipe(
      map(tasksMap => tasksMap[boardId][id]),
      share(),
    );
  }

  update(boardId: Board['id'], id: string, state: Pick<Task, 'title'>): Observable<Task> {
    this.tasks[boardId][id] = {
      ...this.tasks[boardId][id],
      ...state,
    };
    this.tasksSubject_.next(this.tasks);
    return this.tasksSubject_.pipe(
      map(tasksMap => tasksMap[boardId][id]),
      share(),
    );
  }

  remove(boardId: Board['id'], id: string): Observable<Task> {
    delete this.tasks[boardId][id];
    this.tasksSubject_.next(this.tasks);
    return this.tasksSubject_.pipe(
      map(tasksMap => tasksMap[boardId][id]),
      share(),
    );
  }
}
