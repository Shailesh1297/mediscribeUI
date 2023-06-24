import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { ToastComponent } from '../components/toast/toast.component';
export interface Toast {
  message: string;
  type: string;
}
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private _snackBar: MatSnackBar) { }

  show(data: Toast): void {
    const config: MatSnackBarConfig<any> = {
      data: { message: data.message },
      duration: 3000,
    }
    this._snackBar.openFromComponent(ToastComponent, config);
  }
}
