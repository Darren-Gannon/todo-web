import { Injectable } from '@angular/core';
import { Observable, of, map, BehaviorSubject, share, Subscription, tap } from 'rxjs';
import { Task } from './task';
import { Board } from '../board';
import { v4 as uuid } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';

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
  ) { }

  find(boardId: Board['id']): Observable<Task[]> {
    this.http.get<Task[]>(`${ this.config.apiUrl }/board/${ boardId }/task`).subscribe(tasks => {
      if(!this.tasks) this.tasks = {};
      if(!this.tasks[boardId]) this.tasks[boardId] = {};
      const tasksMap = tasks.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as any)
      this.tasks[boardId] = tasksMap;
      this.tasksSubject_.next(this.tasks);
    })
    return this.tasksSubject_.pipe(
      map(tasksMap => tasksMap[boardId] ? Object.values(tasksMap[boardId]) ?? [] : []),
      share(),
    );
  }

  create(boardId: Board['id'], task: Pick<Task, 'title' | 'description' | 'stateId'>): Observable<Task> {
    return this.http.post<Task>(`${ this.config.apiUrl }/board/${ boardId }/task`, task).pipe(
      tap(tasks => {
        if(!this.tasks) this.tasks = {};
        if(!this.tasks[boardId]) this.tasks[boardId] = {};
        this.tasks[boardId][tasks.id] = tasks;
        this.tasksSubject_.next(this.tasks);
      }),
    );
  }

  update(boardId: Board['id'], id: string, task: Pick<Task, 'title'>): Observable<Task> {
    return this.http.patch<Task>(`${ this.config.apiUrl }/board/${ boardId }/task/${ id }`, task).pipe(
      tap(task => {
        if(!this.tasks) this.tasks = {};
        if(!this.tasks[boardId]) this.tasks[boardId] = {};
        this.tasks[boardId][task.id] = task;
        this.tasksSubject_.next(this.tasks);
      }),
    );
  }

  remove(boardId: Board['id'], id: string): Observable<Task> {
    return this.http.delete<Task>(`${ this.config.apiUrl }/board/${ boardId }/task/${ id }`).pipe(
      tap(task => {
        delete this.tasks[boardId][id];
        this.tasksSubject_.next(this.tasks);
      }),
    );
  }
}
