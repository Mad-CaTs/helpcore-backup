import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket-service';
import { CategoriaTicketService } from '../../services/categoria-ticket-service';
import { CategoriaTicket } from '../../interfaces/categoria-ticket';

@Component({
  selector: 'app-ticket',
  standalone: false,
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class Ticket implements OnInit{
  ticketForm: FormGroup;
  isLoading = false;
  categoriaTickets: CategoriaTicket[] = [];


  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private categoriaTicketService: CategoriaTicketService
  ) {
    this.ticketForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+51)?\s?\d{9}$/)]],
      codigoAlumno: ['', [Validators.required, Validators.pattern(/^A\d{8}$/)]],
      sede: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      categoria: ['', Validators.required],
      asunto: ['', Validators.required],
      comentarios: ['', Validators.required]
    });
  }

  listarCategoriaTickets(): void {
  this.categoriaTicketService.listarCategoriaTicket().subscribe({
    next: (data) => {
      this.categoriaTickets = data;
      this.isLoading = false;
    },
    error: (err) => {
      console.error("Error al listar categorías:", err);
      this.isLoading = false;
    }
  });
}

ngOnInit(): void {
  this.listarCategoriaTickets();
}


  onSubmit(): void {
    console.log(this.ticketForm.value);
    Object.keys(this.ticketForm.controls).forEach(key => {
      const control = this.ticketForm.get(key);
      console.log(`${key}:`, control?.valid ? '✅ válido' : '❌ inválido', control?.errors);
    });

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
          alert(`¡Ticket creado exitosamente! ID: ${response.ticketId}`);
          this.onReset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Error al crear ticket:', err);
          alert(`Error: ${err}`);
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
  }

  onCancel() {
    console.log('Acción de cancelar');
  }
}
