package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaErrorDTO {
    private String error;
    private String mensaje;
    private String detalles;

    public RespuestaErrorDTO(String error, String mensaje) {
        this.error = error;
        this.mensaje = mensaje;
    }
}