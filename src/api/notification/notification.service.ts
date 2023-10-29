import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, merge, mergeMap, scan, share } from 'rxjs';
import { Config } from '../config';
import { Notification } from './dto/notification';

@Injectable()
export class NotificationService {

  constructor(
    private http: HttpClient,
    private config: Config,
  ) { }
  
  private readonly findAll_ = new Subject();
  private readonly findOne_ = new Subject<string>();
  private readonly markAsRead_ = new Subject<string>();

  private readonly findAllStart$ = this.findAll_.pipe(
    map(data => ({ type: 'findAll' })),
  );
  private readonly findOneStart$ = this.findOne_.pipe(
    map(data => ({ type: 'findOne', data })),
  );
  private readonly markAsReadStart$ = this.markAsRead_.pipe(
    map(data => ({ type: 'markAsRead', data })),
  );

  private readonly findAllEnd$ = this.findAllStart$.pipe(
    mergeMap(action => this.http.get<Notification[]>(`${this.config.apiUrl}/notification`)),
    map(data => ({ type: 'foundAll', data: data })),
  );
  private readonly findOneEnd$ = this.findOneStart$.pipe(
    mergeMap(action => this.http.get<Notification>(`${this.config.apiUrl}/notification/${(action as any).data}`)),
    map(data => ({ type: 'foundOne', data })),
  );
  private readonly markAsReadEnd$ = this.markAsReadStart$.pipe(
    mergeMap(action => this.http.patch<Notification>(`${ this.config.apiUrl }/notification/${ action.data }`, {
      read: true,
    })),
    map(data => ({ type: 'markedAsRead', data })),
  );

  private state$ = merge(
    this.findAllStart$,
    this.findOneStart$,
    this.markAsReadStart$,
    this.findAllEnd$,
    this.findOneEnd$,
    this.markAsReadEnd$,
  ).pipe(
    scan((acc, action) => {
      switch (action.type) {
        case 'findAll':
          return {
            ...acc,
            loading: true,
          };
        case 'findOne':
          return {
            ...acc,
            [(action as any).data]: {
              ...acc.data[(action as any).data],
              loading: true,
            },
          };
        case 'markAsRead':
          return {
            ...acc,
            [(action as any).data]: {
              ...acc.data[(action as any).data],
              updating: true,
            },
          };
        case 'foundAll':
          return {
            ...acc,
            loading: false,
            loaded: true,
            data: (action as any).data.reduce((acc: any, notification: Notification) => ({
              ...acc,
              [notification.id]: {
                data: notification,
                updating: false,
                loading: false,
                loaded: true,
              },
            }), {} as NotificationState),
          };
        case 'foundOne':
          return {
            ...acc,
            data: {
              ...acc.data,
              [(action as any).data.id]: {
                data: (action as any).data,
                updating: false,
                loading: false,
                loaded: true,
              },
            },
          };
        case 'markedAsRead':
          return {
            ...acc,
            data: {
              ...acc.data,
              [(action as any).data.id]: {
                data: (action as any).data,
                updating: false,
                loading: false,
                loaded: true,
              },
            },
          };
        default:
          return acc;
      }
    }, { loaded: false, loading: false, data: {} } as State),
    share(),
  );

  findAll(): Observable<State> {
    setTimeout(() => this.findAll_.next(undefined), 0);
    return this.state$;
  }

  
  findOne(id: string): Observable<NotificationState> {
    setTimeout(() => this.findOne_.next(id), 0);
    return this.state$.pipe(
      map(state => state.data[id]),
    );
  }

  markAsRead(id: string): Observable<NotificationState> {
    setTimeout(() => this.markAsRead_.next(id), 0);
    return this.state$.pipe(
      map(state => state.data[id]),
    );
  }
}

interface State {
  loading: boolean;
  loaded: boolean;
  data: {
    [key: string]: NotificationState,
  };
}

export interface NotificationState {
  data: Notification;
  updating: boolean;
}