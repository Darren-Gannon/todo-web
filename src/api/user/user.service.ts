import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config';
import { User } from './user';

@Injectable()
export class UserService {

  constructor(
    private readonly http: HttpClient,
    private readonly config: Config,
  ) { }

  findAll() {    
    return this.http.get<User[]>(`${ this.config.apiUrl }/user`).pipe(
    );
  }
}
