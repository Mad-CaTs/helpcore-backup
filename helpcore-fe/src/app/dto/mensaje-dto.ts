export interface MensajeDTO {
  id: number;
  idTicket: number;
  idUsuario: number;
  tipoUsuario: string;
  nombreUsuario: string;
  correoUsuario: string;
  mensaje: string;
  fechaCreacion: string;
  esDelUsuarioActual: boolean;
  archivos: ArchivoDTO[];
}

export interface ArchivoDTO {
  id: number;
  nombreOriginal: string;
  nombreAlmacenado: string;
  rutaArchivo: string;
  tipoMime: string;
  tamano: number;
  esImagen: boolean;
  fechaCreacion: string;
}

export interface ChatTicketDTO {
  idTicket: number;
  estadoTicket: string;
  ticketCerrado: boolean;
  mensajes: MensajeDTO[];
  usuarioPuedeMensajear: boolean;
}

export interface RespuestaCrearMensajeDTO {
  success: boolean;
  mensaje: string;
  mensajeCreado: MensajeDTO;
}

export interface RespuestaCargarArchivoDTO {
  success: boolean;
  mensaje: string;
  archivoCreado: ArchivoDTO;
  error?: string;
}
