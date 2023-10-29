import { Injectable } from '@angular/core';
import { Config } from '../../config';
import { HttpClient } from '@angular/common/http';
import { CreateUserInviteDto } from './dto/create-user-invite.dto';
import { UserInvite } from './dto/user-invite.dto';
import { UpdateUserInviteDto } from './dto/update-user-invite.dto';
import { Subject, map, merge, switchMap } from 'rxjs';

@Injectable()
export class UserInviteService {

  constructor(
    private readonly config: Config,
    private readonly http: HttpClient,
  ) { }
  
  create(boardId: string, userInvite: CreateUserInviteDto) {
    return this.http.post<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite`, userInvite);
  }

  findAllForBoard(boardId: string) {
    return this.http.get<UserInvite[]>(`${ this.config.apiUrl }/board/${ boardId }/user-invite`);
  }

  findOneForBoard(boardId: string, inviteId: string) {
    return this.http.get<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`);
  }

  updateForBoard(boardId: string, inviteId: string, userInvite: UpdateUserInviteDto) {
    return this.http.patch<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`, userInvite);
  }

  removeForBoard(boardId: string, inviteId: string) {
    return this.http.delete<UserInvite>(`${ this.config.apiUrl }/board/${ boardId }/user-invite/${ inviteId }`);
  }

  findAllForUser() {
    return this.http.get<UserInvite[]>(`${ this.config.apiUrl }/user-invite`);
  }

  findOneForUser(inviteId: string) {
    return this.http.get<UserInvite>(`${ this.config.apiUrl }/user-invite/${ inviteId }`);
  }

  approveForUser(inviteId: string) {
    return this.http.put<UserInvite>(`${ this.config.apiUrl }/user-invite/${ inviteId }`, {});
  }

  removeForUser(inviteId: string) {
    return this.http.delete<UserInvite>(`${ this.config.apiUrl }/user-invite/${ inviteId }`);
  }
}
