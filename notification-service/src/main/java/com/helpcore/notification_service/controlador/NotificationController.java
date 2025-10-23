package com.helpcore.notification_service.controlador;

import com.helpcore.notification_service.dto.TicketCreatedDto;
import com.helpcore.notification_service.dto.TicketCreatedResponseDto;
import com.helpcore.notification_service.servicios.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final EmailService emailService;

    @PostMapping("/ticket-creado")
    public ResponseEntity<?> handleTicketCreated(@RequestBody TicketCreatedDto ticket) {
        try{
            String codigoGenerado = emailService.sendTicketCreatedEmails(ticket, "soportehelpcore@gmail.com");
            TicketCreatedResponseDto response = new TicketCreatedResponseDto(
                    codigoGenerado,
                    "Notificación enviada correctamente al equipo de soporte."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al enviar el correo: " + e.getMessage());
        }
    }

    @PostMapping("/ticket-creado/{idUsuario}")
    public ResponseEntity<?> handleTicketCreatedUsuario(@PathVariable Integer idUsuario, @RequestBody TicketCreatedDto ticket) {
        try {
            String codigoGenerado = emailService.sendTicketCreatedEmailUsuario(idUsuario, ticket, "soportehelpcore@gmail.com");
            TicketCreatedResponseDto response = new TicketCreatedResponseDto(
                    codigoGenerado,
                    "Notificación enviada correctamente al equipo de soporte."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al enviar el correo para usuario autenticado: " + e.getMessage());
        }
    }
}