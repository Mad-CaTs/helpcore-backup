import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification-service';
import { finalize } from 'rxjs';
import { AlertService } from '../../services/alert-service';

@Component({
  selector: 'app-consultar-estado',
  standalone: false,
  templateUrl: './consultar-estado.html',
  styleUrl: './consultar-estado.css'
})
export class ConsultarEstado {
  consultaForm: FormGroup;
  mostrarCodigo = false;
  correoVerificado = false;
  isLoading = false;
  emailAsociado: string | null = null; 

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private notyf: AlertService,
  ) {

    this.consultaForm = this.fb.group({
      ticketId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      codigoValidacion: ['', [Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  enviarCodigoPorTicket(): void {
    const ticketControl = this.consultaForm.get('ticketId');
    if (ticketControl?.valid) {
      this.isLoading = true;
      this.notificationService.enviarCodigoPorCodigoTicket(ticketControl.value)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            console.log(response.message);
            this.notyf.success(response.message);
            this.mostrarCodigo = true;
          },
          error: (err) => {
            console.error(err.error?.error || err.message);
            this.notyf.error(err.error?.error || "Error al enviar el código de validación.");
          }
        });
    } else {
      ticketControl?.markAsTouched();
      this.notyf.error("Por favor, ingresa un número de ticket válido antes de continuar.");
    }
  }


  validarCodigo(): void {
    const ticketId = this.consultaForm.get('ticketId')?.value;
    const code = this.consultaForm.get('codigoValidacion')?.value;

    if (!code) {
      this.notyf.error('Debe ingresar el código de verificación');
      return;
    }

    if (!ticketId) {
      this.notyf.error('Debe ingresar el número de ticket');
      return;
    }

    this.isLoading = true;
    this.notificationService.validarCodigoPorTicket(ticketId, code)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log(response.message);
          this.notyf.success(response.message);
          this.correoVerificado = true;
        },
        error: (err) => {
          console.log(err.error.message);
          this.notyf.error(err.error.message);
        }
      });
  }

  onSubmit(): void {
    if (this.consultaForm.valid) {
      this.isLoading = true;
      console.log('Consultando ticket:', this.consultaForm.value);
    } else {
      this.consultaForm.markAllAsTouched();
      this.notyf.error('Debes validar el código antes de consultar el estado.');
    }
  }

  onReset(): void {
    this.consultaForm.reset();
  }

  onCancel(): void {
    console.log('Acción de cancelar');
  }
}