import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config } from './config';
import { BoardService } from './board';
import { TaskService } from './task';
import { StateService } from './state';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { BoardsReducer } from './board/ngrx/board.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BoardEffects } from './board/ngrx/board.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature('boards', BoardsReducer),
    EffectsModule.forFeature(BoardEffects)
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
