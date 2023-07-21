import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { AppPageComponent } from './pages/app-page/app-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AccountPageComponent } from './pages/account-page/account-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: IndexPageComponent },
  { path: 'app', component: AppPageComponent, children: [
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
