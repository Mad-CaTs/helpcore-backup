import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  mensaje: string | null = null;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private notyf: AlertService
  ) {
    this.loginForm = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  login() {
    this.mensaje = null;
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.notyf.success("Login exitoso.");
          
          setTimeout(() => {
            const roles = this.authService.getUserRoles();
            if (roles.includes('Administrador')) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/inicio']);
            }
          }, 500);
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.status === 401) {
            this.notyf.error("Correo o contraseña incorrectos.");
          } else if (error.status === 0) {
            this.mensaje = "Error de conexión. Verifica que el servidor esté corriendo.";
          } else if (error.status === 500) {
            this.notyf.error("Correo o contraseña incorrectos.");
          } else {
            this.mensaje = "Ha ocurrido un error inesperado.";
          }
        }
      });
    } else {
      if (this.loginForm.get('correo')?.hasError('email')) {
        this.mensaje = "Por favor ingresa un correo electrónico válido.";
      } else {
        this.mensaje = "Por favor completa todos los campos correctamente.";
      }
    }
  }
}