package com.helpcore.ticket_service.entidades;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_archivo_respuesta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivoRespuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_respuesta", referencedColumnName = "id_respuesta", nullable = false)
    @JsonIgnoreProperties("archivos")
    private RespuestaTicket respuesta;

    @Column(name = "nombre_original", nullable = false)
    private String nombreOriginal;

    @Column(name = "nombre_almacenado", nullable = false)
    private String nombreAlmacenado;

    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;

    @Column(name = "tipo_mime", nullable = false)
    private String tipoMime;

    @Column(name = "tamaño")
    private Long tamaño;

    @Column(name = "es_imagen")
    private boolean esImagen;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "activo", nullable = false)
    private boolean activo;

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        activo = true;
        esImagen = tipoMime != null && tipoMime.startsWith("image/");
    }
}