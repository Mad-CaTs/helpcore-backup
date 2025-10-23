import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerTicketDto, EstadoTicket, PrioridadTicket } from '../../dto/ver-ticket-dto';
import { TicketService } from '../../services/ticket-service';
import { ChatService} from '../../services/chat-service';
import { AlertService } from '../../services/alert-service';
import { AuthService } from '../../services/auth-service';
import { ArchivoDTO, ChatTicketDTO, MensajeDTO } from '../../dto/mensaje-dto';

@Component({
  selector: 'app-ver-ticket',
  standalone: false,
  templateUrl: './ver-ticket.html',
  styleUrl: './ver-ticket.css'
})
export class VerTicketComponent implements OnInit, AfterViewChecked {
  ticket: VerTicketDto | null = null;
  isLoading = true;
  codigoTicket: string = '';
  
  usuarioId: number | null = null;
  usuarioRoles: string[] = [];
  
  EstadoTicket = EstadoTicket;
  PrioridadTicket = PrioridadTicket;

  // Variables para el chat
  mensajesChatLocal: MensajeDTO[] = [];
  nuevoMensaje: string = '';
  chatCargando = false;
  enviandoMensaje = false;
  cargandoArchivo = false;
  archivoSeleccionado: File | null = null;
  imagenSeleccionada: string | null = null;
  shouldScrollToBottom: boolean = false;

  @ViewChild('chatMessages') chatMessages: ElementRef | null = null;

  constructor(
    private ticketService: TicketService,
    private chatService: ChatService,
    private alertService: AlertService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.authService.getCurrentUserId();
    this.usuarioRoles = this.authService.getUserRoles();
    
    console.log('=== DEBUG ROLES ===');
    console.log('usuarioId:', this.usuarioId);
    console.log('usuarioRoles:', this.usuarioRoles);
    console.log('esAgente():', this.esAgente());
    console.log('=================');
    
    if (!this.usuarioId) {
      this.router.navigate(['/inicio']);
      return;
    }
    
    this.route.queryParams.subscribe(params => {
      this.codigoTicket = params['codigo'];
      if (this.codigoTicket) {
        this.cargarTicket();
      } else {
        this.alertService.error('No se proporcionó un código de ticket válido');
        this.router.navigate(['/inicio']);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollAlFinal();
      this.shouldScrollToBottom = false;
    }
  }

  cargarTicket(): void {
    this.isLoading = true;
    this.ticketService.obtenerTicketCompleto(this.codigoTicket, this.usuarioId!).subscribe({
      next: (data) => {
        this.ticket = data;
        this.isLoading = false;
        this.cargarChat();
      },
      error: (err) => {
        console.error('Error al cargar ticket:', err);
        const mensajeError = err.error?.message || 'Error al cargar el ticket';
        this.alertService.error(mensajeError);
        this.isLoading = false;
        this.router.navigate(['/inicio']);
      }
    });
  }

  cargarChat(): void {
    if (!this.ticket?.id || !this.usuarioId) return;

    this.chatCargando = true;
    this.chatService.obtenerChatTicket(this.ticket.id, this.usuarioId).subscribe({
      next: (chat: ChatTicketDTO) => {
        this.mensajesChatLocal = chat.mensajes;
        this.chatService.actualizarMensajes(chat.mensajes);
        this.chatCargando = false;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        console.error('Error al cargar chat:', err);
        this.chatCargando = false;
      }
    });
  }

  enviarMensaje(evento?: Event): void {
    // Si se presiona Enter sin Shift, enviar mensaje
    if (evento && evento instanceof KeyboardEvent) {
      if (evento.key === 'Enter' && !evento.shiftKey) {
        evento.preventDefault();
      } else {
        return; // No enviar si es Enter+Shift o cualquier otra tecla
      }
    }

    // Validaciones
    const textoLimpio = this.nuevoMensaje.trim();
    
    if (!textoLimpio && !this.archivoSeleccionado) {
      this.alertService.error('Escribe un mensaje o adjunta un archivo');
      return;
    }

    if (!this.ticket || !this.usuarioId) {
      this.alertService.error('No se pudo obtener la información necesaria');
      return;
    }

    this.enviandoMensaje = true;
    
    // Enviar mensaje con o sin texto
    const mensajeAEnviar = textoLimpio || '(Archivo adjunto)';
    
    this.chatService.crearMensaje(this.ticket.id, mensajeAEnviar, this.usuarioId).subscribe({
      next: (respuesta) => {
        if (respuesta.success && respuesta.mensajeCreado) {
          // Agregar el mensaje localmente
          this.mensajesChatLocal.push(respuesta.mensajeCreado);
          this.nuevoMensaje = '';
          
          // Si hay archivo, adjuntarlo
          if (this.archivoSeleccionado) {
            this.adjuntarArchivoAlMensaje(respuesta.mensajeCreado.id);
          } else {
            this.enviandoMensaje = false;
            this.shouldScrollToBottom = true;
          }
        }
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        const mensaje = err.error?.mensaje || err.error?.error || 'Error al enviar el mensaje';
        this.alertService.error(mensaje);
        this.enviandoMensaje = false;
      }
    });
  }

  onArchivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      
      // Validar tamaño (máximo 10 MB)
      const maxTamaño = 10 * 1024 * 1024;
      if (archivo.size > maxTamaño) {
        this.alertService.error('El archivo no puede exceder 10 MB');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      const tiposPermitidos = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ];

      if (!tiposPermitidos.includes(archivo.type)) {
        this.alertService.error('Tipo de archivo no permitido');
        input.value = '';
        return;
      }

      this.archivoSeleccionado = archivo;
      console.log('Archivo seleccionado:', archivo.name);
    }
  }

  adjuntarArchivoAlMensaje(idRespuesta: number): void {
    if (!this.archivoSeleccionado) {
      this.enviandoMensaje = false;
      return;
    }

    this.cargandoArchivo = true;
    
    this.chatService.adjuntarArchivo(idRespuesta, this.archivoSeleccionado).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.alertService.success('Archivo adjuntado exitosamente');
          this.limpiarFormulario();
          // Recargar el chat para mostrar el archivo
          this.cargarChat();
        }
      },
      error: (err) => {
        console.error('Error al adjuntar archivo:', err);
        const mensaje = err.error?.mensaje || err.error?.error || 'Error al adjuntar el archivo';
        this.alertService.error(mensaje);
        this.limpiarFormulario();
      }
    });
  }

  limpiarFormulario(): void {
    this.archivoSeleccionado = null;
    this.enviandoMensaje = false;
    this.cargandoArchivo = false;
  }

  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
  }

  descargarArchivo(archivo: ArchivoDTO): void {
    this.chatService.descargarArchivo(archivo.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo.nombreOriginal;
        enlace.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success('Archivo descargado correctamente');
      },
      error: (err) => {
        console.error('Error al descargar archivo:', err);
        this.alertService.error('Error al descargar el archivo');
      }
    });
  }

  verImagenGrande(archivo: ArchivoDTO): void {
    if (archivo.esImagen) {
      // Construir la URL completa de la imagen
      this.imagenSeleccionada = `data:${archivo.tipoMime};base64,${this.obtenerBase64Archivo(archivo)}`;
    }
  }

  obtenerBase64Archivo(archivo: ArchivoDTO): string {
    // Si el archivo tiene contenido en base64, devolverlo
    // Nota: Esto depende de cómo tu backend devuelva los archivos
    // Puede que necesites ajustar esto según tu implementación
    if ((archivo as any).contenidoBase64) {
      return (archivo as any).contenidoBase64;
    }
    
    // Si no hay contenido base64, devolver string vacío
    // La imagen se debe cargar desde rutaArchivo en el servidor
    return '';
  }

  formatearTamanio(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  scrollAlFinal(): void {
    try {
      if (this.chatMessages?.nativeElement) {
        const elemento = this.chatMessages.nativeElement;
        elemento.scrollTop = elemento.scrollHeight;
      }
    } catch (err) {
      console.warn('Error al hacer scroll:', err);
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  tomarTicket(): void {
    if (!this.ticket || !this.usuarioId) {
      this.alertService.error('No se pudo obtener la información necesaria');
      return;
    }

    this.ticketService.tomarTicket(this.ticket.id, this.usuarioId).subscribe({
      next: (ticketActualizado) => {
        this.ticket = ticketActualizado;
        this.alertService.success('Ticket asignado correctamente');
      },
      error: (err) => {
        console.error('Error al tomar el ticket:', err);
        const mensajeError = err.error?.message || 'Error al asignar el ticket';
        this.alertService.error(mensajeError);
      }
    });
  }

 /*  marcarComoResuelto(): void {
    if (!this.ticket || !this.usuarioId) {
      this.alertService.error('No se pudo obtener la información necesaria');
      return;
    }

    this.ticketService.marcarComoResuelto(this.ticket.id, this.usuarioId).subscribe({
      next: (ticketActualizado) => {
        this.ticket = ticketActualizado;
        this.alertService.success('Ticket marcado como resuelto');
      },
      error: (err) => {
        console.error('Error al marcar como resuelto:', err);
        const mensajeError = err.error?.message || 'Error al actualizar el ticket';
        this.alertService.error(mensajeError);
      }
    });
  }
 */
  /* cerrarTicket(): void {
    if (!this.ticket || !this.usuarioId) {
      this.alertService.error('No se pudo obtener la información necesaria');
      return;
    }

    this.alertService.confirm(
      '¿Estás seguro de cerrar este ticket?',
      'Esta acción no se puede deshacer'
    ).then((confirmado) => {
      if (confirmado && this.ticket && this.usuarioId) {
        this.ticketService.cerrarTicket(this.ticket.id, this.usuarioId).subscribe({
          next: (ticketActualizado) => {
            this.ticket = ticketActualizado;
            this.alertService.success('Ticket cerrado exitosamente');
          },
          error: (err) => {
            console.error('Error al cerrar ticket:', err);
            const mensajeError = err.error?.message || 'Error al cerrar el ticket';
            this.alertService.error(mensajeError);
          }
        });
      }
    });
  } */

  // Métodos de verificación de estado
  esTicketNuevo(): boolean {
    return this.ticket?.estado === EstadoTicket.NUEVO;
  }

  esTicketEnAtencion(): boolean {
    return this.ticket?.estado === EstadoTicket.EN_ATENCION;
  }

  esTicketResuelto(): boolean {
    return this.ticket?.estado === EstadoTicket.RESUELTO;
  }

  esTicketCerrado(): boolean {
    return this.ticket?.estado === EstadoTicket.CERRADO;
  }

  tieneAgenteAsignado(): boolean {
    return this.ticket?.agente != null;
  }

  esAgenteAsignado(): boolean {
    return this.ticket?.agente?.id === this.usuarioId;
  }

  esAgente(): boolean {
    if (!this.usuarioRoles || this.usuarioRoles.length === 0) {
      return false;
    }
    
    return this.usuarioRoles.some(rol => 
      rol && rol.toLowerCase().includes('agente')
    );
  }

  esAdministrador(): boolean {
    if (!this.usuarioRoles || this.usuarioRoles.length === 0) {
      return false;
    }
    
    return this.usuarioRoles.some(rol => 
      rol && (rol.toLowerCase().includes('administrador') || rol.toLowerCase().includes('admin'))
    );
  }

  // Métodos de estilo
  getEstadoBadgeClass(): string {
    if (!this.ticket) return '';
    
    const clases: { [key: string]: string } = {
      'NUEVO': 'badge-nuevo',
      'EN_ATENCION': 'badge-en-atencion',
      'RESUELTO': 'badge-resuelto',
      'CERRADO': 'badge-cerrado'
    };
    return clases[this.ticket.estado] || '';
  }

  getPrioridadBadgeClass(): string {
    if (!this.ticket) return '';
    
    const clases: { [key: string]: string } = {
      'BAJA': 'badge-baja',
      'MEDIA': 'badge-media',
      'ALTA': 'badge-alta',
      'URGENTE': 'badge-urgente'
    };
    return clases[this.ticket.prioridad] || '';
  }

  getEstadoTexto(): string {
    if (!this.ticket) return '';
    return this.ticket.estado.replace('_', ' ');
  }

  getTiempoTranscurrido(): string {
    if (!this.ticket?.fechaCreacion) return '';
    
    const fecha = new Date(this.ticket.fechaCreacion);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) {
      return `Creado hace ${dias} día${dias > 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `Creado hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else {
      const minutos = Math.floor(diff / (1000 * 60));
      return `Creado hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }
  }
}