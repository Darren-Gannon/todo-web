import { NgModule, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs';
import { AccountPageComponent } from './pages/account-page/account-page.component';
import { AppPageComponent } from './pages/app-page/app-page.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { NotificationListPageComponent } from './pages/notification-list-page/notification-list-page.component';
import { NotificationPageComponent } from './pages/notification-page/notification-page.component';
import { UserInvitePageComponent } from './pages/user-invite-page/user-invite-page.component';
import { UserInviteListPageComponent } from './pages/user-invite-list-page/user-invite-list-page.component';

@Injectable({
  providedIn: 'root'
})
class isSignedIn implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.isAuthenticated$.pipe(
      map(isSignedIn => {
        if(isSignedIn) return true;
        this.router.navigateByUrl('/')
        return false;
      })
    )
  }
}
@Injectable({
  providedIn: 'root'
})
class isSignedOut implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.isAuthenticated$.pipe(
      map(isSignedIn => {
        if(!isSignedIn) return true;
        this.router.navigateByUrl('/app')
        return false;
      })
    )
  }
}

const routes: Routes = [
  { path: '', canActivate: [isSignedOut], pathMatch: 'full', component: IndexPageComponent },
  { path: 'app', canActivate: [isSignedIn], component: AppPageComponent, children: [
    { path: 'account', component: AccountPageComponent },
    { path: 'notification', children: [
      { path: ':notification_id', component: NotificationPageComponent },
      { path: '', pathMatch: 'full', component: NotificationListPageComponent },
    ] },
    { path: 'invite', children: [
      { path: '', component: UserInviteListPageComponent },
      { path: ':invite_id', component: UserInvitePageComponent },
    ] },
    { path: 'board', loadChildren: () => import('./board/board.module').then(m => m.BoardModule) },
    { path: '', pathMatch: 'full', redirectTo: 'board' },
  ] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
