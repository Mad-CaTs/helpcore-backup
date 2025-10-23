package com.helpcore.ticket_service.entidades;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_respuesta_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket", referencedColumnName = "id_ticket", nullable = false)
    @JsonIgnoreProperties({"categoria", "historial"})
    private Ticket ticket;

    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario;

    @Column(name = "tipo_usuario")
    @Enumerated(EnumType.STRING)
    private TipoUsuario tipoUsuario; // CLIENTE o AGENTE

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "activo", nullable = false)
    private boolean activo;

    @OneToMany(mappedBy = "respuesta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("respuesta")
    private java.util.List<ArchivoRespuesta> archivos;

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        activo = true;
        if (archivos == null) {
            archivos = new java.util.ArrayList<>();
        }
    }

    public enum TipoUsuario {
        CLIENTE, AGENTE
    }
}