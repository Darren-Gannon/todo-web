import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { Notification } from './dto/notification';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';

@Injectable()
export class NotificationService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }

  private state: State = {};
  private readonly state_ = new BehaviorSubject<State>({});

  findAll(): Observable<Notification[]> {
    return this._findAll().pipe( // Channel Error on this call, but not on state so that it mimics an HTTP call
      tap(notifications => {
         // Clear original state
        this.state = notifications.reduce((acc, notification) => {
          acc[notification.id] = notification;
          return acc;
        }, {} as State);
        this.state_.next(this.state);
      }),
      switchMap(() => this.state_.asObservable()), // Ignore val as its been tapped through
      map(state => Object.values(state)),
    );
  }

  private _findAll() {
    return this.http.get<Notification[]>(`${ this.config.apiUrl }/notification`).pipe(
      map(notifications => notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
    )
  }

  
  findOne(id: string) {
    return this._findOne(id).pipe(
      tap(notification => {
         // Clear original state
        this.state[notification.id] = notification;
        this.state_.next(this.state);
      }),
      switchMap(() => this.state_.asObservable()), // Ignore val as its been tapped through
      map(state => state[id]),
    )
  }
  
  private _findOne(id: string) {
    return this.http.get<Notification>(`${ this.config.apiUrl }/notification/${ id }`)
  }

  markAsRead(id: string) {
    return this._markAsRead(id).pipe(
      tap(notification => {
         // Clear original state
        this.state[notification.id] = notification;
        this.state_.next(this.state);
      }),
      switchMap(() => this.state_.asObservable()), // Ignore val as its been tapped through
      map(state => state[id]),
    )
  }

  private _markAsRead(id: string) {
    return this.http.patch<Notification>(`${ this.config.apiUrl }/notification/${ id }`, {
      read: true,
    })
  }
}

type State = { [key: string]: Notification };