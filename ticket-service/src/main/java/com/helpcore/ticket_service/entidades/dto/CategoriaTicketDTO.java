package com.helpcore.ticket_service.entidades.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaTicketDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
    private Integer idCategoriaPadre;
    private CategoriaTicketDTO categoriaPadre;
    private List<CategoriaTicketDTO> subcategorias;
    private boolean activo;
    private boolean esPadre;
}