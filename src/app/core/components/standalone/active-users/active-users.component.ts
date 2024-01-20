import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';

import { WebSocketService } from '../../../services';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-active-users',
  standalone: true,
  imports: [CommonModule, MatSelectModule],
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.scss']
})
export class ActiveUsersComponent implements OnInit,OnChanges, OnDestroy {

  @Input() userId: string | null = null;

  @Output() user = new EventEmitter<User | null>();

  activeUsers: User[] = [];
  streamers: Set<string> = new Set();
  selectedUser: User | null = null;

  private activeSubscription!: Subscription;
  private streamersSubscription!: Subscription;

  constructor(private websocket: WebSocketService) { }

  ngOnDestroy(): void {
    this.activeSubscription?.unsubscribe();
    this.streamersSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.activeSubscription = this.websocket.activeUsers().subscribe(activeUsers => {
      //suggestion: getUserId method should be user service
      this.activeUsers = (<User[]>Object.values(activeUsers)).filter((user: User) => user.userId != this.websocket.getUserId);
      //incase of user disconnected
      const findUser = this.activeUsers.find(user => user.userId == this.selectedUser?.userId);
      if (!findUser) {
        this.onActiveUserChange(<any>{ value: null });
      }
    });

    this.streamersSubscription = this.websocket.streamers().subscribe(streamers => {
      this.streamers = new Set(streamers);
    })

    this.websocket.getActives();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'].currentValue != changes['userId'].previousValue && this.selectedUser?.userId != this.userId) {
      const findUser = this.activeUsers.find(user => user.userId == this.userId);
      if (findUser) {
        this.onActiveUserChange(<any>{ value: findUser });
      }
    }
  }


  onActiveUserChange(change: MatSelectChange): void {
    console.log(change);
    this.selectedUser = change.value;
    this.user.emit(this.selectedUser);
  }

}
