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
import { StatesEffects } from './state/ngrx/state.effects';
import { StatesReducer } from './state/ngrx/state.reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature('boards', BoardsReducer),
    StoreModule.forFeature('states', StatesReducer),
    EffectsModule.forFeature(BoardEffects, StatesEffects),
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
