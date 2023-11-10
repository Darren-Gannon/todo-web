import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config } from './config';
import { BoardService } from './board';
import { TaskService } from './board/task';
import { StateService } from './board/state';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { UserService } from './user';
import { BoardUserService } from './board/board-user';
import { NotificationService } from './notification/notification.service';
import { UserInviteService } from './board/user-invite/user-invite.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    BoardService,
    StateService,
    TaskService,
    UserService,
    BoardUserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    NotificationService,
    UserInviteService,
  ],
})
export class ApiModule {
  static forRoot(config: Config): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [
        { provide: Config, useValue: config },
      ]
    }
  }
}
