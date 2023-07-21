import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config } from './config';
import { BoardService } from './board';
import { TaskService } from './task';
import { StateService } from './state';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [
    BoardService,
    StateService,
    TaskService,
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
