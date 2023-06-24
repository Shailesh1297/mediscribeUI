import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AjaxService } from '../../core/services';
import { LoginDTO, TokenResponse } from '../models';
import { API_CONSTANTS } from '../../core/models/api.constants';

@Injectable()
export class LoginService {

  constructor(private ajax: AjaxService) { }

  authenticate(authData: LoginDTO): Observable<TokenResponse> {
    return this.ajax.post(API_CONSTANTS.AUTHENTICATE, authData, {});
  }
}
