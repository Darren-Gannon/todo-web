import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { State, Task, CachedResult } from '../../../../../api';
import { CacheCrud } from 'src/api/cache-crud';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {

  public readonly Object = Object;
  public readonly confirm = confirm;

  public readonly taskForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    description: this.fb.control(''),
    stateId: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    public readonly dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: TaskDialogData,
    private readonly fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.taskForm.patchValue({
      title: this.data.task?.title,
      description: this.data.task?.description,
      stateId: this.data.task?.stateId ?? this.data.state.id,
    });
  }
}

export interface TaskDialogData {
  task?: Task;
  states: { [stateId: string]: CacheCrud<State>; };
  state: State;
}

export type TaskDialogResult = {
  action: 'submit'
  task: Pick<Task, 'title' | 'description' | 'stateId'>;
} | {
  action: 'delete'
}