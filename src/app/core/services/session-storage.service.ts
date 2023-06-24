import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }

  setItem(key: string, value: string): void {
    window.sessionStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    let item = window.sessionStorage.getItem(key);
    return item ? item : null;
  }

  removeItem(key: string): void {
    window.sessionStorage.removeItem(key);
  }

  clear(): void {
    window.sessionStorage.clear();
  }
}
