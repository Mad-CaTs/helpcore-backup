package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonaDTO {

    private Integer id;
    private String nombres;
    private String apellidos;
    private String dni;
    private String telefono;
    private Integer idSede;
    private PersonaDTO.SedeDTO sede;
    private String codigoAlumno;
    private boolean activo;
    private LocalDateTime fechaCreacion;
    @Data
    public static class SedeDTO {
        private Integer id;
        private String nombre;
    }
}

