import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from "../services";

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    constructor(private localStorage: LocalStorageService) {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.localStorage.getItem('accessToken')) {
            req = req.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + this.localStorage.getItem('accessToken')
                }
            });
        }
        return next.handle(req);
    }
}