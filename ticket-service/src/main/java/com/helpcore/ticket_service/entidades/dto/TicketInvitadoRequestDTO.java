package com.helpcore.ticket_service.entidades.dto;

import com.helpcore.ticket_service.entidades.Invitado;
import com.helpcore.ticket_service.entidades.Ticket;
import lombok.Data;

@Data
public class TicketInvitadoRequestDTO {

    private String titulo;

    private String descripcion;

    private Ticket.Estado estado;

    private Invitado invitado;

    private Ticket.Prioridad prioridad;

    private String codigoAlumno;

    private String sede;

    private String idUsuarioCliente;

    private String idUsuarioAgente;

    private String categoria;

}