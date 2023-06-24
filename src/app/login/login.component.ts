import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LocalStorageService, ToastService } from '../core/services';
import { LoginService } from './services/login.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  constructor(private toast: ToastService,
    private service: LoginService,
    private user: UserService,
    private localStorage: LocalStorageService,
    private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();

  }

  submitForm(): void {
    console.log(this.loginForm.value);
    if(!this.loginForm.valid)
      return;
    this.service.authenticate(this.loginForm.value).subscribe(resp => {
      if (resp.code === 1) {
        this.localStorage.setItem('accessToken',resp.data.token);
        this.user.setLoggedIn = true;
        this.test();
      }
    })
  }

  test() {
    this.user.fetchUserDetails().subscribe(resp => {
      console.log(resp);
      this.router.navigate(['home'],{replaceUrl: true});
    });
      
  }


  private initializeForm(): void {
    this.loginForm = new FormGroup({
      username: new FormControl<string>('', {validators:[Validators.required], nonNullable: true }),
      password: new FormControl<string>('', {validators:[Validators.required], nonNullable: true })
    });
  }
}
