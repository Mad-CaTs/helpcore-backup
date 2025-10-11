import { Component, OnInit } from '@angular/core';
import { TicketDashboardAgente } from '../../dto/ticket-dashboard-agente';
import { TicketService } from '../../services/ticket-service';
import { AlertService } from '../../services/alert-service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  tickets: TicketDashboardAgente[] = [];
  ticketsFiltrados: TicketDashboardAgente[] = [];
  isLoading = true;
  filtroEstado: string = 'TODOS';
  filtroPrioridad: string = 'TODOS';
  busqueda: string = '';
   
  constructor(
    private ticketService: TicketService,
    private alertService: AlertService
  ) {}
  
  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.isLoading = true;
    this.ticketService.listarDashboardAgente().subscribe({
      next: (data) => {
        this.tickets = data;
        this.ticketsFiltrados = data;
        this.isLoading = false;
        this.alertService.success('Tickets cargados correctamente.');
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
        this.alertService.error('Error al cargar tickets.');
        this.isLoading = false;
      }
    });
  }

  buscarTickets(): void {
    this.aplicarFiltros();
  };

  filtrarPorPrioridad(prioridad: string): void {
    this.filtroPrioridad = prioridad;
    this.aplicarFiltros();
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.aplicarFiltros();
  }

  limpiarTodosLosFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'TODOS';
    this.filtroPrioridad = 'TODOS';
    this.ticketsFiltrados = [...this.tickets];
  }

  aplicarFiltros(): void {
    let resultado = this.tickets;

    const busqueda = this.busqueda.toLowerCase().trim();
    if (busqueda) {
      resultado = resultado.filter(t => 
        t.titulo.toLowerCase().includes(busqueda) ||
        t.codigoAlumno.toLowerCase().includes(busqueda) ||
        `${t.invitado.nombre} ${t.invitado.apellido}`.toLowerCase().includes(busqueda) ||
        t.categoria.nombre.toLowerCase().includes(busqueda) ||
        t.sede.toLowerCase().includes(busqueda)
      );
    }

    if(this.filtroEstado !== 'TODOS') {
      resultado = resultado.filter(t => t.estado === this.filtroEstado);
    }

    if(this.filtroPrioridad !== 'TODOS') {
      resultado = resultado.filter(t => t.prioridad === this.filtroPrioridad);
    }

    this.ticketsFiltrados = resultado;
  }

  contarPorEstado(estado: string): number {
    return this.tickets.filter(t => t.estado === estado).length;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'NUEVO': 'badge-nuevo',
      'EN_ATENCION': 'badge-en-atencion',
      'RESUELTO': 'badge-resuelto',
      'CERRADO': 'badge-cerrado'
    };
    return clases[estado] || 'badge-default';   
  }

  getPrioridadBadgeClass(prioridad: string): string {
    const clases: { [key: string]: string } = {
      'BAJA': 'badge-prioridad-baja',
      'MEDIA': 'badge-prioridad-media',
      'ALTA': 'badge-prioridad-alta',
      'URGENTE': 'badge-prioridad-urgente'
    };
    return clases[prioridad] || 'badge-default';
  }
}
