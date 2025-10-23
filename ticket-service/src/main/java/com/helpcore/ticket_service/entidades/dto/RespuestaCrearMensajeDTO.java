package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaCrearMensajeDTO {
    private boolean success;
    private String mensaje;
    private MensajeDTO mensajeCreado;
}