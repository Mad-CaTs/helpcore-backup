package com.helpcore.ticket_service.entidades.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Integer id;
    private String correo;
    private PersonaDTO persona;
    private List<RolDTO> roles;
    private boolean activo;
}