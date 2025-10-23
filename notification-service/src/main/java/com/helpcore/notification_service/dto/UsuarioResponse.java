package com.helpcore.notification_service.dto;

import lombok.Data;

@Data
public class UsuarioResponse {
    private Integer id;
    private String correo;
    private PersonaResponse persona;
}