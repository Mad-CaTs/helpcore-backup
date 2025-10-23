package com.helpcore.notification_service.dto;

import lombok.Data;

@Data
public class TicketCreatedDto {
    private String nombres;
    private String codigoTicket;
    private String apellidos;
    private String dni;
    private String telefono;
    private String correoInvitado;
    private String codigoAlumno;
    private String sede;
    private String categoria;
    private String asunto;
    private String comentarios;
}