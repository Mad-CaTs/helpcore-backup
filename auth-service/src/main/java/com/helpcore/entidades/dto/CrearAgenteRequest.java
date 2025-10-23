package com.helpcore.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CrearAgenteRequest {
    private String nombres;
    private String apellidos;
    private String dni;
    private String telefono;
    private String correo;
    private String contrasena;
}
