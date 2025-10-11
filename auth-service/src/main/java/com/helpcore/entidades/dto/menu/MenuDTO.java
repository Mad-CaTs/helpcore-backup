package com.helpcore.entidades.dto.menu;

import com.helpcore.entidades.Menu;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuDTO {
    private Integer id;
    private String nombre;
    private String ruta;
    private String icono;
    private Integer menuPadreId;
    private String menuPadreNombre;
    private boolean activo;
    private LocalDateTime fechaCreacion;

    public static MenuDTO fromEntity(Menu menu) {
        if (menu == null) return null;

        return MenuDTO.builder()
                .id(menu.getId())
                .nombre(menu.getNombre())
                .menuPadreId(menu.getMenuPadre() != null ? menu.getMenuPadre().getId() : null)
                .menuPadreNombre(menu.getMenuPadre() != null ? menu.getMenuPadre().getNombre() : null)
                .activo(menu.isActivo())
                .fechaCreacion(menu.getFechaCreacion())
                .build();
    }
}