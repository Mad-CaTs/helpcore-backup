package com.helpcore.ticket_service.entidades.dto;

import jdk.jfr.DataAmount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@DataAmount
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivoDTO {
    private Integer id;
    private String nombreOriginal;
    private String nombreAlmacenado;
    private String rutaArchivo;
    private String tipoMime;
    private Long tamaño;
    private boolean esImagen;
    private LocalDateTime fechaCreacion;
}