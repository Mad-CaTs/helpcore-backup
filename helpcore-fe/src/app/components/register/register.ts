import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert-service';
import { RegisterRequestDTO } from '../../dto/register-request-dto';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registroForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      codigo: ['', [Validators.required, Validators.minLength(4)]],
      sede: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.markFormGroupTouched(this.registroForm);
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValues = this.registroForm.value;
    
    const registerData: RegisterRequestDTO = {
      nombres: formValues.nombres.trim(),
      apellidos: formValues.apellidos.trim(),
      dni: formValues.dni,
      telefono: formValues.telefono,
      codigo: formValues.codigo.trim(),
      sede: formValues.sede.trim(),
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
        console.error('❌ Error en el registro:', error);
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
        
        this.errorMessage = errorMsg;
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
    if (control?.hasError('pattern')) {
      if (fieldName === 'dni') return 'DNI debe tener 8 dígitos';
      if (fieldName === 'telefono') return 'Teléfono debe tener 9 dígitos';
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.registroForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}