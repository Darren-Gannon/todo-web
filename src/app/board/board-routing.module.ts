import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewBoardPageComponent } from './pages/new-board-page/new-board-page.component';
import { BoardListPageComponent } from './pages/board-list-page/board-list-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { BoardSettingsPageComponent } from './pages/board-settings-page/board-settings-page.component';

const routes: Routes = [
  { path: '', component: BoardListPageComponent },
  { path: 'new', component: NewBoardPageComponent },
  { path: ':boardId', children: [
    { path: '', component: BoardPageComponent },
    { path: 'settings', component: BoardSettingsPageComponent },
  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
