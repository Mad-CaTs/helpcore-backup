package com.helpcore.ticket_service.entidades.dto;

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
public class MensajeDTO {
    private Integer id;
    private Integer idTicket;
    private Integer idUsuario;
    private String tipoUsuario; // CLIENTE o AGENTE
    private String nombreUsuario;
    private String correoUsuario;
    private String mensaje;
    private LocalDateTime fechaCreacion;
    private boolean esDelUsuarioActual;
    private List<ArchivoDTO> archivos;
}
