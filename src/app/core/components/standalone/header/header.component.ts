import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LocalStorageService, ToastService } from '../../../services';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title = 'MediScribe';

  constructor(
    private toast: ToastService,
    private localStorage: LocalStorageService,
    public user: UserService,
    private router: Router) {}

  ngOnInit(): void { }

  show(){
    this.toast.show({message:'MediScribe!',type:''});
  }

  logout(): void{
   this.localStorage.removeItem('accessToken');
    this.user.setLoggedIn = false;
   this.router.navigate(['login'],{ replaceUrl: true });
  }

}
