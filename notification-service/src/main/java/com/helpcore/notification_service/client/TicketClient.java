package com.helpcore.notification_service.client;

import com.helpcore.notification_service.dto.ConsultarTicketResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ticket-service")
public interface TicketClient {
    @GetMapping("/ticket/codigo/{codigoTicket}")
    ConsultarTicketResponseDto obtenerPorCodigo(@PathVariable("codigoTicket") String codigoTicket);
}
