import { Injectable } from '@angular/core';
import { AjaxService } from './ajax.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../models/api.constants';
import { User } from '../models/user.model';
import { UserApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user!: User;
  private loggedIn: boolean = false;

  constructor(private ajax: AjaxService) { }

  set setUser(user: User) {
    this.user = user;
  }

  get getUser() {
    return this.user;
  }

  set setLoggedIn(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }

  get isLoggedIn() {
    return this.loggedIn;
  }

  fetchUserDetails(): Observable<UserApiResponse> {
    return this.ajax.get(API_CONSTANTS.VALID);
  }
}
