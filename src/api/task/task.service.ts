import { Injectable } from '@angular/core';
import { Observable, of, map, BehaviorSubject, share } from 'rxjs';
import { Task } from './task';
import { Board } from '../board';

// const TASKS: Task[] = [
//   {
//     id: '1',
//     createdAt: new Date().toISOString(),
//     description: 'Desc',
//     title: 'Title',
//     stateId: '1',
//   },
//   {
//     id: '1',
//     createdAt: new Date().toISOString(),
//     description: 'Desc',
//     title: 'Title 2',
//     stateId: '1',
//   },
// ];

@Injectable()
export class TaskService {

  private tasks: { [id: Board['id']]: {[id: Task['id']]: Task} } = {
  };
  private tasksSubject_ = new BehaviorSubject(this.tasks);

  constructor() { }

  find(boardId: Board['id']): Observable<Task[]> {
    return this.tasksSubject_.pipe(
      map(tasksMap => tasksMap[boardId] ? Object.values(tasksMap[boardId]) ?? [] : []),
      share(),
    );
  }

  tasksCounter = 0;
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
