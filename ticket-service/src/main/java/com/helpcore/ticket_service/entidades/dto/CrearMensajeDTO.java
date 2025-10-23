package com.helpcore.ticket_service.entidades.dto;

import com.helpcore.ticket_service.entidades.RespuestaTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearMensajeDTO {
    private Integer idTicket;
    private String mensaje;
}
