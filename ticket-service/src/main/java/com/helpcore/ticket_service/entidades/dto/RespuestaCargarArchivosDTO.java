package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaCargarArchivosDTO {
    private boolean success;
    private String mensaje;
    private ArchivoDTO archivoCreado;
    private String error;
}