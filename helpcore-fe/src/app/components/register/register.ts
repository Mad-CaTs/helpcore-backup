import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert-service';
import { RegisterRequestDTO } from '../../dto/register-request-dto';
import { SedeService } from '../../services/sede-service';
import { Sede } from '../../interfaces/sede';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  registroForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private sedeService: SedeService
  ) {
    this.registroForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/), Validators.maxLength(8)]],
      telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/), Validators.maxLength(9)]],
      codigo: ['', [Validators.required, Validators.pattern(/^i\d{8}$/i), Validators.maxLength(9)]],
      sede: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]]
    });
  }

  onSubmit(): void {
  if (this.registroForm.invalid) {
    this.markFormGroupTouched(this.registroForm);
    
    const firstErrorField = Object.keys(this.registroForm.controls).find(key => {
      const control = this.registroForm.get(key);
      return control && control.invalid;
    });

    if (firstErrorField) {
      const errorMsg = this.getErrorMessage(firstErrorField);
      this.alertService.error(errorMsg || 'Por favor, completa todos los campos correctamente');
    }
    
    return;
  }

  this.loading = true;

  const formValues = this.registroForm.value;

  const codigoNormalized = (formValues.codigo || '').trim().toLowerCase();

  const registerData: RegisterRequestDTO = {
    nombres: formValues.nombres.trim(),
    apellidos: formValues.apellidos.trim(),
    dni: formValues.dni,
    telefono: formValues.telefono,
    codigo: codigoNormalized,
    idSede: Number(formValues.sede),
    correo: formValues.correo.trim().toLowerCase(),
    contrasena: formValues.contrasena
  };

  console.log('📤 Datos a enviar:', registerData);

  this.authService.register(registerData).subscribe({
    next: (response) => {
      console.log('✅ Registro exitoso:', response);
      this.loading = false;

      this.alertService.success('Cuenta registrada correctamente');

      setTimeout(() => {
        this.router.navigate(['/inicio']);
      }, 1000);
    },
    error: (error) => {
      console.error('Error en el registro:', error);
      this.loading = false;

      let errorMsg = 'Error al registrar. Intenta nuevamente';

      if (error.error?.error) {
        errorMsg = error.error.error;
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.status === 400) {
        errorMsg = 'Datos inválidos. Verifica la información ingresada';
      } else if (error.status === 409) {
        errorMsg = 'El correo o DNI ya están registrados';
      }

      this.alertService.error(errorMsg);
    }
  });
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
  const control = this.registroForm.get(fieldName);

  if (control?.hasError('required')) {
    return 'Este campo es obligatorio';
  }
  if (control?.hasError('email')) {
    return 'Correo electrónico inválido';
  }
  if (control?.hasError('minlength')) {
    const minLength = control.errors?.['minlength'].requiredLength;
    return `Mínimo ${minLength} caracteres`;
  }
  if (control?.hasError('maxlength')) {
    const maxLength = control.errors?.['maxlength'].requiredLength;
    return `Máximo ${maxLength} caracteres`;
  }
  if (control?.hasError('pattern')) {
    if (fieldName === 'dni') return 'DNI debe tener exactamente 8 dígitos';
    if (fieldName === 'telefono') return 'Teléfono debe comenzar con 9 y tener 9 dígitos';
    if (fieldName === 'codigo') return 'Código debe ser: i seguido de 8 dígitos (ej: i12345678)';
  }

  return '';
}

  isFieldInvalid(fieldName: string): boolean {
    const control = this.registroForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  sedes: Sede[] = [];

  ngOnInit(): void {
    this.sedeService.listar().subscribe({
      next: data => this.sedes = data,
      error: err => console.error('Error al listar sedes:', err)
    });
  }
}