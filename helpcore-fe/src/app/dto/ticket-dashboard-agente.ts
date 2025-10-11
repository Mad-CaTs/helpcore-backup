export interface TicketDashboardAgente  {
    id: number;
    titulo: string;
    estado: 'NUEVO' | 'EN_ATENCION' | 'RESUELTO' | 'CERRADO';
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    codigoAlumno: string;
    sede: string;
    idUsuarioAgente: number | null;
    fechaCreacion: string;

    invitado: {
        nombre: string;
        apellido: string;
    };

    categoria: {
        nombre: string;
    };
}