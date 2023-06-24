import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';

import { UserService } from '../services/user.service';


export const authGuard = (next: ActivatedRouteSnapshot) => {
    return inject(UserService).isLoggedIn ? true : createUrlTreeFromSnapshot(next, ['/','login']);
};