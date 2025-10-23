import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket-service';
import { CategoriaTicketService } from '../../services/categoria-ticket-service';
import { CategoriaTicket } from '../../interfaces/categoria-ticket';
import { finalize, Observable } from 'rxjs';
import { AlertService } from '../../services/alert-service';
import { NotificationService } from '../../services/notification-service';
import { AuthService } from '../../services/auth-service';
import { SedeService } from '../../services/sede-service';
import { Sede } from '../../interfaces/sede';
import { Usuario } from '../../interfaces/usuario';

interface CategoriaOption {
  id: number;
  nombre: string;
  esPadre: boolean;
  disabled: boolean;
  indentacion: string;
}

@Component({
  selector: 'app-ticket',
  standalone: false,
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class Ticket implements OnInit {
  ticketForm: FormGroup;
  isLoading = false;
  mostrarCodigo = false;
  correoVerificado = false;
  categoriaTickets: CategoriaTicket[] = [];
  categoriasPlanas: CategoriaOption[] = [];
  isAuthenticated$: Observable<boolean>;
  isAuthenticated: boolean = false;
  currentUserId: number | null = null;
  sedes: Sede[] = [];
  idSede: number = 0;
  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private categoriaTicketService: CategoriaTicketService,
    private notificationService: NotificationService,
    private notyf: AlertService,
    private authService: AuthService,
    private sedeService: SedeService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    this.ticketForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+51)?\s?\d{9}$/)]],
      codigoAlumno: ['', [Validators.required, Validators.pattern(/^A\d{8}$/)]],
      sede: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*@(?:[A-Za-z]+\.)+[A-Za-z]{2,}$/)
      ]],
      codigoValidacion: ['', [Validators.pattern(/^[0-9]{6}$/)]],
      categoria: ['', Validators.required],
      asunto: ['', Validators.required],
      comentarios: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.authService.obtenerUsuarioActual().subscribe(usuario => {
      this.idSede = usuario.persona.idSede ?? 0;
    });
    this.listarCategoriaTickets();
    this.listarSedes();
    this.mostrarCodigo = false;
    this.correoVerificado = false;
    this.ticketForm.get('codigoValidacion')?.disable();

    this.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.configurarValidadores();

      if (isAuth) {
        this.currentUserId = this.authService.getCurrentUserId();
        console.log('Usuario ID:', this.currentUserId);
      }
    });
  }

  configurarValidadores(): void {
    if (this.isAuthenticated) {
      this.ticketForm.get('nombres')?.clearValidators();
      this.ticketForm.get('apellidos')?.clearValidators();
      this.ticketForm.get('dni')?.clearValidators();
      this.ticketForm.get('telefono')?.clearValidators();
      this.ticketForm.get('codigoAlumno')?.clearValidators();
      this.ticketForm.get('sede')?.clearValidators();
      this.ticketForm.get('email')?.clearValidators();
      this.ticketForm.get('codigoValidacion')?.clearValidators();
    } else {
      this.ticketForm.get('nombres')?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]);
      this.ticketForm.get('apellidos')?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]);
      this.ticketForm.get('dni')?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      this.ticketForm.get('telefono')?.setValidators([Validators.required, Validators.pattern(/^(\+51)?\s?\d{9}$/)]);
      this.ticketForm.get('codigoAlumno')?.setValidators([Validators.required, Validators.pattern(/^A\d{8}$/)]);
      this.ticketForm.get('sede')?.setValidators([Validators.required]);
      this.ticketForm.get('email')?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*@(?:[A-Za-z]+\.)+[A-Za-z]{2,}$/)
      ]);
    }

    Object.keys(this.ticketForm.controls).forEach(key => {
      this.ticketForm.get(key)?.updateValueAndValidity();
    });
  }

  listarCategoriaTickets(): void {
    this.categoriaTicketService.listar().subscribe({
      next: (data) => {
        this.categoriaTickets = data;
        this.categoriasPlanas = this.aplanarCategorias(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al listar categorías:", err);
        this.isLoading = false;
      }
    });
  }

  aplanarCategorias(categorias: CategoriaTicket[], nivel: number = 0): CategoriaOption[] {
    const resultado: CategoriaOption[] = [];

    categorias.forEach(categoria => {
      resultado.push({
        id: categoria.id!,
        nombre: categoria.nombre,
        esPadre: categoria.esPadre,
        disabled: categoria.esPadre,
        indentacion: '\u00A0'.repeat(nivel * 4)
      });

      if (categoria.subcategorias && categoria.subcategorias.length > 0) {
        resultado.push(...this.aplanarCategorias(categoria.subcategorias, nivel + 1));
      }
    });

    return resultado;
  }

  listarSedes(): void {
    this.sedeService.listar().subscribe({
      next: (data) => {
        this.sedes = data;
      },
      error: (err) => {
        console.error('Error al listar sedes:', err);
      }
    });
  }

  enviarCodigo(): void {
    const emailControl = this.ticketForm.get('email');
    if (emailControl?.valid) {
      this.ticketForm.get('codigoValidacion')?.reset();
      this.isLoading = true;
      this.notificationService.enviarCodigo(emailControl.value)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            console.log(response.message);
            this.notyf.success(response.message);
            this.mostrarCodigo = true;
            this.correoVerificado = false;
            this.ticketForm.get('email')?.disable();
            this.ticketForm.get('codigoValidacion')?.enable();
          },
          error: (err) => {
            console.error('Error status:', err.status);
            console.error('Error message:', err.error?.message || err.message);

            this.notyf.error(err.error?.message || err.error?.error || err.message);

            if (err.status === 403) {
              this.mostrarCodigo = false;
              this.correoVerificado = false;

              this.ticketForm.get('email')?.enable();
              this.ticketForm.get('codigoValidacion')?.disable();
              this.ticketForm.get('codigoValidacion')?.reset();
            } else {
              this.mostrarCodigo = false;
              this.correoVerificado = false;
              this.ticketForm.get('email')?.enable();
              this.ticketForm.get('codigoValidacion')?.disable();
              this.ticketForm.get('codigoValidacion')?.reset();
            }
          }
        });
    } else {
      emailControl?.markAsTouched();
      this.notyf.error("Por favor, ingresa un correo electrónico válido antes de continuar.");
    }
  }

  validarCodigo(): void {
    const email = this.ticketForm.get('email')?.value;
    const code = this.ticketForm.get('codigoValidacion')?.value;

    if (!email || !code) {
      this.notyf.error("Debe ingresar el código de verificación");
      return;
    }

    this.isLoading = true;
    this.notificationService.validarCodigo(email, code)
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

  permitirEditarCorreo(): void {
    this.correoVerificado = false;
    this.mostrarCodigo = false;
    this.ticketForm.get('email')?.enable();
    this.ticketForm.get('codigoValidacion')?.reset();
    this.ticketForm.get('codigoValidacion')?.disable();
  }

  onSubmit(): void {
    console.log('Datos del formulario:', this.ticketForm.value);

    if (!this.isAuthenticated && !this.correoVerificado) {
      this.notyf.error('Debe validar su correo antes de enviar el ticket.');
      return;
    }

    if (this.ticketForm.valid) {
      this.isLoading = true;

      if (this.isAuthenticated) {
        this.crearTicketUsuario();
      } else {
        this.crearTicketInvitado();
      }
    } else {
      this.ticketForm.markAllAsTouched();

      const invalidFields = Object.keys(this.ticketForm.controls)
        .filter(key => this.ticketForm.get(key)?.invalid)
        .join(', ');

      console.log('Campos inválidos:', invalidFields);
      this.notyf.error(`Por favor, complete correctamente: ${invalidFields}`);
    }
  }

  private crearTicketUsuario(): void {
    const nombreSede = this.obtenerNombreSede(this.idSede);
    const ticketData = {
      idUsuario: this.currentUserId,
      idCategoria: +this.ticketForm.get('categoria')?.value,
      titulo: this.ticketForm.get('asunto')?.value,
      descripcion: this.ticketForm.get('comentarios')?.value
    };

    this.ticketService.crearUsuario(ticketData).subscribe({
      next: (response) => {
        console.log('Ticket creado:', response);
        this.notyf.success(`¡Ticket creado exitosamente! ID: ${response.id}`);

        const userEmail = this.authService.getUserEmail();

        if (userEmail) {
          const notificacionData = {
            codigoTicket: response.codigoTicket,
            email: userEmail,
            asunto: ticketData.titulo,
            comentarios: ticketData.descripcion,
            categoria: this.obtenerNombreCategoria(+this.ticketForm.get('categoria')?.value),
            sede: nombreSede
          };

          this.notificationService.enviarNotificacionTicketUsuario(this.currentUserId!, notificacionData)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: (notificacionResponse) => {
                console.log('Notificación enviada:', notificacionResponse);
                console.log('Enviando notificación para usuario ID:', this.currentUserId);
                this.notyf.success(`Notificación enviada. Código del ticket: ${notificacionResponse.codigoTicket}`);
                this.onReset();
              },
              error: (err) => {
                console.error('Error al enviar notificación:', err);
                this.notyf.error('El ticket fue creado, pero hubo un error al enviar la notificación.');
                this.isLoading = false;
                this.onReset();
              }
            });
        } else {
          this.isLoading = false;
          this.onReset();
        }

      },
      error: (err) => {
        console.error('Error al crear ticket:', err);
        const errorMessage = err.error?.error || err.error?.message || 'Error desconocido al crear el ticket';
        this.notyf.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private crearTicketInvitado(): void {
    const ticketData = {
      nombres: this.ticketForm.get('nombres')?.value,
      apellidos: this.ticketForm.get('apellidos')?.value,
      dni: this.ticketForm.get('dni')?.value,
      correoInvitado: this.ticketForm.get('email')?.value,
      telefono: this.ticketForm.get('telefono')?.value,
      codigoAlumno: this.ticketForm.get('codigoAlumno')?.value,
      sede: this.obtenerNombreSede(+this.ticketForm.get('sede')?.value),
      categoria: +this.ticketForm.get('categoria')?.value,
      asunto: this.ticketForm.get('asunto')?.value,
      comentarios: this.ticketForm.get('comentarios')?.value
    };

    this.ticketService.crearInvitado(ticketData).subscribe({
      next: (response) => {
        console.log('Ticket creado:', response);
        this.notyf.success(`¡Ticket creado exitosamente! Código: ${response.codigoTicket}`);

        const notificationData = {
          ...ticketData,
          codigoTicket: response.codigoTicket,
          categoria: this.obtenerNombreCategoria(+this.ticketForm.get('categoria')?.value)
        };

        this.notificationService.enviarNotificacionTicket(notificationData)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (notificacionResponse) => {
              console.log('Notificación enviada:', notificacionResponse);
              this.notyf.success(`Correo enviado. Código: ${notificacionResponse.codigoTicket}`);
              this.onReset();
            },
            error: (err) => {
              console.error('Error al enviar notificación:', err);
              this.notyf.error('El ticket fue creado, pero hubo un error al enviar la notificación.');
              this.onReset();
            }
          });
      },
      error: (err) => {
        console.error('Error al crear ticket:', err);
        const errorMessage = err.error?.error || err.error?.message || 'Error desconocido al crear el ticket';
        this.notyf.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private obtenerNombreCategoria(idCategoria: number): string {
    return this.categoriasPlanas.find(c => c.id === idCategoria)!.nombre;
  }

  private obtenerNombreSede(idSede: number): string {
    const sede = this.sedes.find(s => s.id === idSede);
    return sede ? sede.nombre : '';
  }

  onReset(): void {
    this.ticketForm.reset();
    this.mostrarCodigo = false;
    this.correoVerificado = false;
    this.ticketForm.get('codigoValidacion')?.disable();
  }

  onCancel(): void {
    console.log('Acción de cancelar');
    this.onReset();
  }
}