import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { AppPageComponent } from './pages/app-page/app-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ApiModule } from '../api';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { AccountPageComponent } from './pages/account-page/account-page.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { AuthModule } from '@auth0/auth0-angular';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    AppComponent,
    IndexPageComponent,
    AppPageComponent,
    HomePageComponent,
    AccountPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ApiModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    AuthModule.forRoot({
      domain: 'cortex-todo.us.auth0.com',
      clientId: 'empJeIxteS3FnsHr4958Kl5nHQmPxSrx',
      authorizationParams: {
        redirect_uri: window.location.origin,
      }
    }),
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { panelClass: ['col-xs-10', 'col-sm-8', 'col-md-6'], height: '90vh' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
