package com.helpcore.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TicketCreatedResponseDto {
    private String codigoTicket;
    private String mensaje;
}