package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatTicketDTO {
    private Integer idTicket;
    private String estadoTicket;
    private boolean ticketCerrado;
    private List<MensajeDTO> mensajes;
    private boolean usuarioPuedeMensajear;
}