package com.helpcore.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EditarAgenteRequest {
    private String nombres;
    private String apellidos;
    private String telefono;
    private boolean activo;
}