import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { BoardRoutingModule } from './board-routing.module';
import { NewBoardPageComponent } from './pages/new-board-page/new-board-page.component';
import { BoardListPageComponent } from './pages/board-list-page/board-list-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { TaskDialogComponent } from './pages/board-page/task-dialog/task-dialog.component';
import { BoardSettingsPageComponent } from './pages/board-settings-page/board-settings-page.component';


@NgModule({
  declarations: [
    NewBoardPageComponent,
    BoardListPageComponent,
    BoardPageComponent,
    TaskDialogComponent,
    BoardSettingsPageComponent
  ],
  imports: [
    CommonModule,
    BoardRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatIconModule,
    MatRippleModule,
    MatToolbarModule,
    MatDialogModule,
    MatSelectModule,
    MatListModule,
    DragDropModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatMenuModule,
  ]
})
export class BoardModule { }
