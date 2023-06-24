import { ActivatedRouteSnapshot } from "@angular/router";



export const userAccessGuard  = (next: ActivatedRouteSnapshot) => {
    return true;
  }
