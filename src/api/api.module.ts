import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config } from './config';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
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
