package com.helpcore.ticket_service.entidades.dto;

import com.helpcore.ticket_service.entidades.Ticket;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VerTicketDTO {
    private Integer id;
    private String codigoTicket;
    private String titulo;
    private String descripcion;
    private Ticket.Estado estado;
    private Ticket.Prioridad prioridad;
    private String codigoAlumno;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaResolucion;
    private LocalDateTime fechaCierre;

    private SolicitanteDTO solicitante;
    private AgenteDTO agente;
    private CategoriaDTO categoria;

    @Data
    public static class SolicitanteDTO {
        private Integer id;
        private String nombre;
        private String apellido;
        private String correo;
        private String telefono;
        private String dni;
        private String codigoAlumno;
        private SedeDTO sede;  // Agregar este campo
    }

    @Data
    public static class SedeDTO {
        private Integer id;
        private String nombre;
    }

    @Data
    public static class AgenteDTO {
        private Integer id;
        private String nombreCompleto;
        private String correo;
    }

    @Data
    public static class CategoriaDTO {
        private Integer id;
        private String nombre;
    }
}