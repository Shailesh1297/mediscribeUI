import { Component, OnInit } from '@angular/core';

import { WebSocketService } from '../core/services';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  activeUser: User | null = null;
  activeUserId: string | null = null;

  constructor(public websoket: WebSocketService) {
    this.websoket.connect(`user-${Date.now() / (1000)}`);
  }

  ngOnInit(): void {
  }

  onActiveUserChange(user: User | null): void {
    this.activeUser = user;
    this.activeUserId = user?.userId || null;
  }

  switchUser(userId: string) {
    this.activeUserId = userId;
  }

}
