export interface TicketDashboardAgente {
  id: number;
  codigoTicket: string;
  titulo: string;
  estado: string;
  prioridad: string;
  codigoAlumno: string;
  sede: string;
  idUsuarioAgente?: number;
  fechaCreacion: string;
  invitado: {
    nombre: string;
    apellido: string;
  };
  categoria: {
    nombre: string;
  };
}