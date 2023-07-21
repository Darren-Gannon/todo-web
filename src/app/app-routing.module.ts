import { NgModule, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs';
import { AccountPageComponent } from './pages/account-page/account-page.component';
import { AppPageComponent } from './pages/app-page/app-page.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';

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
    { path: 'board', loadChildren: () => import('./board/board.module').then(m => m.BoardModule) },
    { path: '', pathMatch: 'full', redirectTo: 'board' },
  ] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
