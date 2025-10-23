package com.helpcore.notification_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PersonaResponse {
    private Integer id;
    private String nombres;
    private String apellidos;
    private String dni;
    private String telefono;
    private String email;
    private String codigoAlumno;
    @JsonProperty("sede")
    private String sede;
}