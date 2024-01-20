import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ActiveUsersComponent, StreamingComponent } from '../core/components/standalone';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    //standalone
    StreamingComponent,
    ActiveUsersComponent
  ]
})
export class HomeModule { }
