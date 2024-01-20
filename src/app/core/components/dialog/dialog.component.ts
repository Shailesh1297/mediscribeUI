import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogData } from '../../models';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
  public dialogRef: MatDialogRef<DialogComponent>) {}

  onNegativeClick() {
    this.dialogRef.close(false);
  }

  onPositiveClick() {
    this.dialogRef.close(true);
  }

}
