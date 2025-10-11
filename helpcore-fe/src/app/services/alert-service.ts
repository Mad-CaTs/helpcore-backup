import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';
import Swal, { SweetAlertResult } from 'sweetalert2';

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

 confirm(
  title: string, 
  text: string, 
  confirmText = 'Sí', 
  cancelText = 'Cancelar',
  icon: 'warning' | 'question' | 'info' | 'error' | 'success' = 'warning',
  options?: {
    html?: string;
    footer?: string;
    showDenyButton?: boolean;
    denyButtonText?: string;
    reverseButtons?: boolean;
    focusCancel?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    timer?: number;
    timerProgressBar?: boolean;
  }
): Promise<boolean> {
  return Swal.fire({
    title,
    text,
    html: options?.html,
    icon,
    footer: options?.footer,
    showCancelButton: true,
    showDenyButton: options?.showDenyButton || false,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    denyButtonText: options?.denyButtonText || 'No estoy seguro',
    reverseButtons: options?.reverseButtons || false,
    focusCancel: options?.focusCancel || false,
    allowOutsideClick: options?.allowOutsideClick ?? true,
    allowEscapeKey: options?.allowEscapeKey ?? true,
    timer: options?.timer,
    timerProgressBar: options?.timerProgressBar || false,
    iconColor: '#000000',
    customClass: {
      popup: 'bg-white text-dark border-0 shadow-lg rounded-3',
      title: 'text-dark fw-bold fs-4 mb-3',
      htmlContainer: 'text-dark fs-6',
      actions: 'd-flex justify-content-center gap-2 mt-4',
      confirmButton: 'btn btn-dark text-white px-4 py-2 rounded-pill shadow-sm',
      cancelButton: 'btn btn-outline-dark px-4 py-2 rounded-pill',
      denyButton: 'btn btn-secondary px-4 py-2 rounded-pill',
      icon: 'border-dark-icon mb-3',
      footer: 'text-muted small mt-3'
    },
    buttonsStyling: false,
    backdrop: 'rgba(0, 0, 0, 0.4)',
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    },
    didOpen: () => {
      // Aplicar estilos personalizados al ícono
      const iconElement = document.querySelector('.swal2-icon') as HTMLElement;
      if (iconElement) {
        iconElement.style.border = '3px solid #000000';
        iconElement.style.borderRadius = '50%';
        iconElement.style.color = '#000000';
      }
    }
  }).then((result: SweetAlertResult) => {
    return result.isConfirmed;
  });
}
}
