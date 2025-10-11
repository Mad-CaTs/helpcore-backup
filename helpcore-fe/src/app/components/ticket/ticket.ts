import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket-service';
import { CategoriaTicketService } from '../../services/categoria-ticket-service';
import { CategoriaTicket } from '../../interfaces/categoria-ticket';
import { finalize } from 'rxjs';
import { AlertService } from '../../services/alert-service';
import { NotificationService } from '../../services/notification-service';

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

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private categoriaTicketService: CategoriaTicketService,
    private notificationService: NotificationService,
    private notyf: AlertService
  ) {
    this.ticketForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+51)?\s?\d{9}$/)]],
      codigoAlumno: ['', [Validators.required, Validators.pattern(/^A\d{8}$/)]],
      sede: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*@(?:[A-Za-z]+\.)+[A-Za-z]{2,}$/)]],
      codigoValidacion: ['', [Validators.pattern(/^[0-9]{6}$/)]],
      categoria: ['', Validators.required],
      asunto: ['', Validators.required],
      comentarios: ['', Validators.required]
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
      // Agregar la categoría actual
      resultado.push({
        id: categoria.id!,
        nombre: categoria.nombre,
        esPadre: categoria.esPadre,
        disabled: categoria.esPadre, // Los padres no son seleccionables
        indentacion: '\u00A0'.repeat(nivel * 4) // Espacios no-break para indentación
      });

      // Si tiene subcategorías, procesarlas recursivamente
      if (categoria.subcategorias && categoria.subcategorias.length > 0) {
        const subcategorias = this.aplanarCategorias(categoria.subcategorias, nivel + 1);
        resultado.push(...subcategorias);
      }
    });

    return resultado;
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
            console.log(response.message)
            this.notyf.success(response.message)
            this.mostrarCodigo = true; 
            this.correoVerificado = false;
            this.ticketForm.get('email')?.disable();
            this.ticketForm.get('codigoValidacion')?.enable();
          },
          error: (err) => {
            console.error(err.message);
            this.notyf.error(err.message)
          }
        });
    } else {
      emailControl?.markAsTouched();
      this.notyf.error("Por favor, ingresa un correo electrónico válido antes de continuar.")
    }
  }

  validarCodigo(): void {
    const email = this.ticketForm.get('email')?.value;
    const code = this.ticketForm.get('codigoValidacion')?.value;

    if (!email || !code) {
      this.notyf.error("Debe ingresar el código de verificación")
      return;
    }

    this.isLoading = true;
    this.notificationService.validarCodigo(email, code)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => { 
          console.log(response.message);
          this.notyf.success(response.message)
          this.correoVerificado = true; 
        },
        error: (err) => {
          console.log(err.error.message);
          this.notyf.error(err.error.message)
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

  ngOnInit(): void {
    this.listarCategoriaTickets();
    this.mostrarCodigo = false;
    this.correoVerificado = false;
    this.ticketForm.get('codigoValidacion')?.disable();
  }

  onSubmit(): void {
    console.log(this.ticketForm.value);
    Object.keys(this.ticketForm.controls).forEach(key => {
      const control = this.ticketForm.get(key);
      console.log(`${key}:`, control?.valid ? '✅ válido' : '❌ inválido', control?.errors);
    });

    if (!this.correoVerificado) {
      this.notyf.error('Debe validar su correo antes de enviar el ticket.')
      return;
    }

    if (this.ticketForm.valid) {
      this.isLoading = true;

      const ticketData = {
        nombres: this.ticketForm.get('nombres')?.value,
        apellidos: this.ticketForm.get('apellidos')?.value,
        dni: this.ticketForm.get('dni')?.value,
        email: this.ticketForm.get('email')?.value,
        telefono: this.ticketForm.get('telefono')?.value,
        codigoAlumno: this.ticketForm.get('codigoAlumno')?.value,
        sede: this.ticketForm.get('sede')?.value,
        categoria: +this.ticketForm.get('categoria')?.value,
        asunto: this.ticketForm.get('asunto')?.value,
        comentarios: this.ticketForm.get('comentarios')?.value
      };

      this.ticketService.crearInvitado(ticketData).subscribe({
        next: (response) => {
          console.log('✅ Ticket creado:', response);
          this.notyf.success(`¡Ticket creado exitosamente! ID: ${response.ticketId}`);
          this.onReset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Error al crear ticket:', err);
          this.notyf.error(err.error?.message);
          this.isLoading = false;
        }
      });
    } else {
      this.ticketForm.markAllAsTouched();
      alert('Por favor, complete todos los campos obligatorios correctamente');
    }
  }

  onReset() {
    this.ticketForm.reset();
    this.mostrarCodigo = false;
    this.correoVerificado = false;
  }

  onCancel() {
    console.log('Acción de cancelar');
  }
}