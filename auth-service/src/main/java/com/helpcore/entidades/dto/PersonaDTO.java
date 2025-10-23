package com.helpcore.entidades.dto;

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
    private String codigoAlumno;
    private Integer idSede;
    private SedeDTO sede;
    private boolean activo;
    private LocalDateTime fechaCreacion;


}