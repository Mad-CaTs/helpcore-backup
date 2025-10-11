package com.helpcore.entidades.dto;

import com.helpcore.entidades.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolSimpleDTO {

    private Integer id;
    private String nombre;
    private String descripcion;
    private boolean activo;
    private LocalDateTime fechaCreacion;

    // Constructor desde entidad
    public static RolSimpleDTO fromEntity(Rol rol) {
        return RolSimpleDTO.builder()
                .id(rol.getId())
                .nombre(rol.getNombre())
                .descripcion(rol.getDescripcion())
                .activo(rol.isActivo())
                .fechaCreacion(rol.getFechaCreacion())
                .build();
    }
}