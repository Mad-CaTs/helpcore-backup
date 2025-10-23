package com.helpcore.ticket_service.controladores;

import com.helpcore.ticket_service.entidades.CategoriaTicket;
import com.helpcore.ticket_service.entidades.Invitado;
import com.helpcore.ticket_service.entidades.Ticket;
import com.helpcore.ticket_service.entidades.dto.*;
import com.helpcore.ticket_service.repositorios.CategoriaTicketRepository;
import com.helpcore.ticket_service.servicios.TicketService;
import org.apache.http.protocol.HTTP;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ticket")
public class TicketController {

    @Autowired
    TicketService ticketService;

    @Autowired
    CategoriaTicketRepository categoriaTicketRepository;

    @PostMapping("/crear-usuario")
    public ResponseEntity<?> crearTicketConUsuario(@RequestBody TicketUsuarioRequestDTO dto) {
        try {
            Ticket ticket = ticketService.crearTicketConUsuario(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al crear ticket: " + e.getMessage());
        }
    }


    @PostMapping("/crear-invitado")
    public ResponseEntity<Map<String, Object>> crearTicketDesdeFormulario(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();

        try {
            PersonaDTO personaDTO = PersonaDTO.builder()
                    .nombres((String) requestData.get("nombres"))
                    .apellidos((String) requestData.get("apellidos"))
                    .dni((String) requestData.get("dni"))
                    .telefono((String) requestData.get("telefono"))
                    .codigoAlumno((String) requestData.get("codigoAlumno"))
                    .activo(true)
                    .build();

            TicketInvitadoRequestDTO ticket = new TicketInvitadoRequestDTO();
            ticket.setTitulo((String) requestData.get("asunto"));
            ticket.setDescripcion((String) requestData.get("comentarios"));
            ticket.setCodigoAlumno((String) requestData.get("codigoAlumno"));
            ticket.setSede((String) requestData.get("sede"));
            ticket.setCorreoInvitado((String) requestData.get("correoInvitado"));

            Integer idCategoria = null;
            Object categoriaObj = requestData.get("categoria");
            if (categoriaObj == null) {
                categoriaObj = requestData.get("id_categoria");
            }

            if (categoriaObj != null) {
                idCategoria = categoriaObj instanceof Integer
                        ? (Integer) categoriaObj
                        : Integer.parseInt(categoriaObj.toString());
            }


            if (personaDTO.getNombres() == null || personaDTO.getNombres().trim().isEmpty()) {
                response.put("error", "Los nombres son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }

            if (personaDTO.getApellidos() == null || personaDTO.getApellidos().trim().isEmpty()) {
                response.put("error", "Los apellidos son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }

            if (personaDTO.getDni() == null || personaDTO.getDni().trim().isEmpty()) {
                response.put("error", "El DNI es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            if (ticket.getTitulo() == null || ticket.getTitulo().trim().isEmpty()) {
                response.put("error", "El asunto es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            if (ticket.getDescripcion() == null || ticket.getDescripcion().trim().isEmpty()) {
                response.put("error", "Los comentarios son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }

            if (idCategoria == null) {
                response.put("error", "La categoría es obligatoria");
                return ResponseEntity.badRequest().body(response);
            }

            Ticket nuevoTicket = ticketService.crearTicketConInvitado(ticket, personaDTO, idCategoria);

            response.put("success", true);
            response.put("ticketId", nuevoTicket.getId());
            response.put("codigoTicket", nuevoTicket.getCodigoTicket());
            response.put("message", "Ticket creado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Error al crear el ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/dashboard/{idUsuario}")
    public ResponseEntity<?> obtenerTicketsPorUsuario(@PathVariable Integer idUsuario) {
        try {
            List<TicketDashboardAgenteDTO> tickets = ticketService.obtenerTicketsPorRolDeUsuario(idUsuario);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tickets", tickets);
            response.put("total", tickets.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al obtener tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    @GetMapping("/ver-ticket")
    public ResponseEntity<?> obtenerTicketCompleto(
            @RequestParam String codigoTicket,
            @RequestParam Integer idUsuario) {
        try {
            VerTicketDTO ticket = ticketService.obtenerTicketCompleto(codigoTicket, idUsuario);

            if (ticket == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Ticket no encontrado o no autorizado");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("ticket", ticket);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al obtener el ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/tomar-ticket/{idTicket}")
    public ResponseEntity<?> tomarTicket(
            @PathVariable Integer idTicket,
            @RequestParam Integer idUsuarioAgente) {
        try {
            Ticket ticketActualizado = ticketService.tomarTicket(idTicket, idUsuarioAgente);

            VerTicketDTO ticketDTO = ticketService.obtenerTicketCompletoById(ticketActualizado.getId(), idUsuarioAgente);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ticket asignado correctamente");
            response.put("ticket", ticketDTO);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/codigo/{codigoTicket}")
    public ResponseEntity<?> obtenerPorCodigo(@PathVariable String codigoTicket) {
        try {
            Ticket ticket = ticketService.obtenerPorCodigo(codigoTicket);

            if (ticket == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket no encontrado para el código: " + codigoTicket));
            }

            ConsultarTicketResponseDTO response = new ConsultarTicketResponseDTO();
            response.setCodigoTicket(ticket.getCodigoTicket());
            response.setCorreoInvitado(ticket.getCorreoInvitado());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
