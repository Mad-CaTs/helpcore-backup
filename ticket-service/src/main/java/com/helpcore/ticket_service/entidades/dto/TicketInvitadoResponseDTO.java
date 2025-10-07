package com.helpcore.ticket_service.entidades.dto;

import com.helpcore.ticket_service.entidades.CategoriaTicket;
import com.helpcore.ticket_service.entidades.Invitado;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Data
public class TicketInvitadoResponseDTO {

    private Integer id;

    private String titulo;

    private String descripcion;

    private Estado estado;

    private Prioridad prioridad;

    private String codigoAlumno;

    private String sede;

    private Invitado invitado;

    private Integer idUsuarioCliente;

    private Integer idUsuarioAgente;

    private CategoriaTicket categoria;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaAsignacion;

    private LocalDateTime fechaResolucion;

    private LocalDateTime fechaCierre;

    private boolean activo;


    public enum Estado {
        NUEVO, EN_ATENCION, RESUELTO, CERRADO
    }

    public enum Prioridad {
        BAJA, MEDIA, ALTA, URGENTE
    }
}