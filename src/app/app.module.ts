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
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NotificationListPageComponent } from './pages/notification-list-page/notification-list-page.component';
import { NotificationPageComponent } from './pages/notification-page/notification-page.component';
import { MatBadgeModule } from '@angular/material/badge';
import { UserInvitePageComponent } from './pages/user-invite-page/user-invite-page.component';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    IndexPageComponent,
    AppPageComponent,
    HomePageComponent,
    AccountPageComponent,
    NotificationListPageComponent,
    NotificationPageComponent,
    UserInvitePageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ApiModule.forRoot({
      apiUrl: environment.apiUrl,
    }),
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    MatBadgeModule,
    AuthModule.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: environment.auth0.audience,
      }
    }),
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
