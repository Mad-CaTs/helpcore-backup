package com.helpcore.ticket_service.entidades.dto;

import com.helpcore.ticket_service.entidades.Ticket;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketDashboardAgenteDTO {
    private Integer id;
    private String titulo;
    private Ticket.Estado estado;
    private Ticket.Prioridad prioridad;
    private String codigoAlumno;
    private String sede;

    private Integer idUsuarioAgente;
    private LocalDateTime fechaCreacion;

    private InvitadoSimpleDTO invitado;
    private CategoriaSimpleDTO categoria;

    @Data
    public static class InvitadoSimpleDTO {
        private String nombre;
        private String apellido;
    }

    @Data
    public static class CategoriaSimpleDTO {
        private String nombre;
    }
}
