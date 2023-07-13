import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { AppPageComponent } from './pages/app-page/app-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ApiModule } from '../api';

@NgModule({
  declarations: [
    AppComponent,
    IndexPageComponent,
    AppPageComponent,
    HomePageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ApiModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
