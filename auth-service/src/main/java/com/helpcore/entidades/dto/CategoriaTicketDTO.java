package com.helpcore.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaTicketDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
    private boolean activo;
    private Integer idCategoriaPadre;
}
