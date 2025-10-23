package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketUsuarioRequestDTO {
    private Integer idCategoria;
    private String titulo;
    private String descripcion;
    private Integer idUsuario;
}