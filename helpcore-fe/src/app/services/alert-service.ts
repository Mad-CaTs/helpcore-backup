import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private notyf: Notyf;

  constructor() {
    this.notyf = new Notyf({
      duration: 2000,
      position: { x: 'right', y: 'top' },
      dismissible: true
    });
  }

  success(message: string) {
    this.notyf.success(message);
  }

  error(message: string) {
    this.notyf.error(message);
  }

  info(message: string) {
    this.notyf.open({
      type: 'info',
      message
    });
  }
}
