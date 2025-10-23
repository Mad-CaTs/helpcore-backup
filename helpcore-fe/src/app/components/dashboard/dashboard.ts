import { Component, OnInit } from '@angular/core';
import { TicketDashboardAgente } from '../../dto/ticket-dashboard-agente';
import { TicketService } from '../../services/ticket-service';
import { AlertService } from '../../services/alert-service';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

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
  filtroPrioridad: string = 'TODAS';
  busqueda: string = '';
  
  usuarioId: number | null = null;
  usuarioRoles: string[] = [];
   
  constructor(
    private ticketService: TicketService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.isLoading = true;
    
    this.usuarioId = this.authService.getCurrentUserId();
    this.usuarioRoles = this.authService.getUserRoles();
    
    if (!this.usuarioId) {
      this.alertService.error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      this.isLoading = false;
      return;
    }

    this.ticketService.obtenerTicketsPorUsuario(this.usuarioId).subscribe({
      next: (data) => {
        this.tickets = data;
        this.ticketsFiltrados = data;
        this.isLoading = false;
        
        const mensaje = this.obtenerMensajeCarga();
        this.alertService.success(mensaje);
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
        const mensajeError = err.error?.message || 'Error al cargar los tickets';
        this.alertService.error(mensajeError);
        this.isLoading = false;
      }
    });
  }

  private obtenerMensajeCarga(): string {
    const totalTickets = this.tickets.length;
    
    if (this.esAdministrador()) {
      return `${totalTickets} tickets cargados. Mostrando todos los tickets del sistema.`;
    } else if (this.tieneRol('USUARIO')) {
      return `${totalTickets} tickets cargados. Mostrando solo tus tickets.`;
    } else {
      return `${totalTickets} tickets cargados. Mostrando tickets de tus categorías asignadas.`;
    }
  }


  buscarTickets(): void {
    this.aplicarFiltros();
  }

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
    this.filtroPrioridad = 'TODAS';
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
        (t.sede && t.sede.toLowerCase().includes(busqueda))
      );
    }

    if (this.filtroEstado !== 'TODOS') {
      resultado = resultado.filter(t => t.estado === this.filtroEstado);
    }

    if (this.filtroPrioridad !== 'TODAS') {
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

  tieneRol(rol: string): boolean {
    return this.authService.hasRole(rol);
  }

  esAdministrador(): boolean {
    return this.tieneRol('ADMINISTRADOR');
  }

  esUsuario(): boolean {
    return this.tieneRol('USUARIO');
  }

  esAgente(): boolean {
    return this.usuarioRoles.some(rol => 
      !['ADMINISTRADOR', 'USUARIO'].includes(rol)
    );
  }

  verDetalle(ticket: TicketDashboardAgente): void {
  this.router.navigate(['/ver-ticket'], {
    queryParams: { codigo: ticket.codigoTicket }
  });
}
}