package com.helpcore.ticket_service.entidades.dto;

import com.helpcore.ticket_service.entidades.Ticket;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketDashboardAgenteDTO {
    private Integer id;
    private String titulo;
    private String descripcion;
    private Ticket.Estado estado;
    private Ticket.Prioridad prioridad;
    private String codigoAlumno;
    private String sede;

    private Integer idUsuarioCliente;
    private Integer idUsuarioAgente;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaResolucion;
    private LocalDateTime fechaCierre;

    private boolean activo;

    private InvitadoSimpleDTO invitado;
    private CategoriaSimpleDTO categoria;

    @Data
    public static class InvitadoSimpleDTO {
        private Integer id;
        private String nombre;
        private String apellido;
        private String email;
    }

    @Data
    public static class CategoriaSimpleDTO {
        private Integer id;
        private String nombre;
        private String descripcion;
    }
}
