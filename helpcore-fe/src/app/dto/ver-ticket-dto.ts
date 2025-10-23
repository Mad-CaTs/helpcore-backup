export interface VerTicketDto {
  id: number;
  codigoTicket: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  codigoAlumno: string;
  fechaCreacion: string;
  fechaAsignacion?: string;
  fechaResolucion?: string;
  fechaCierre?: string;
  solicitante: Solicitante;
  agente?: Agente;
  categoria: Categoria;
  sede: Sede;
}

export interface Solicitante {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  sede: Sede;
  dni: string;
  codigoAlumno: string;
}

export interface Agente {
  id: number;
  nombreCompleto: string;
  email: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Sede {
  id: number;
  nombre: string;
}

export enum EstadoTicket {
  NUEVO = 'NUEVO',
  EN_ATENCION = 'EN_ATENCION',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO'
}

export enum PrioridadTicket {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}