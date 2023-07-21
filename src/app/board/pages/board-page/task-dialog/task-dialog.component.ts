import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../../../../api/task';
import { FormBuilder, Validators } from '@angular/forms';
import { State } from '../../../../../api';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {

  public readonly taskForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    description: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
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
      stateId: this.data.task?.stateId,
    });
  }
}

export interface TaskDialogData {
  task?: Task;
  states: State[];
}

export interface TaskDialogResult {
  task: Pick<Task, 'title' | 'description' | 'stateId'>;
}