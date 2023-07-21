import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { State } from '../../../../../api';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-state-dialog',
  templateUrl: './state-dialog.component.html',
  styleUrls: ['./state-dialog.component.scss']
})
export class StateDialogComponent implements OnInit, OnDestroy {

  public readonly stateForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] })
  })

  constructor(
    public readonly dialogRef: MatDialogRef<StateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: StateDialogData,
    private readonly fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.stateForm.patchValue({
      title: this.data.state?.title,
    })
  }

  ngOnDestroy(): void {
    
  }
}

interface StateDialogData {
  state?: State;
}


export interface StateDialogResult {
  task: Pick<State, 'title'>;
}