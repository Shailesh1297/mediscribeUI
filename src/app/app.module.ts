import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { RequestInterceptor } from './core/interceptors';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastComponent } from './core/components';
import { HeaderComponent } from './core/components/standalone/header/header.component';
import { DialogComponent } from './core/components/dialog/dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule,
    //standalone
    HeaderComponent
  ],
  exports:[DialogComponent],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
