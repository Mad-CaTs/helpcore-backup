package com.helpcore.ticket_service.entidades;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_ticket_historial")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket", referencedColumnName = "id_ticket", nullable = false)
    private Ticket ticket;

    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario;

    @Column(name = "tipo_accion", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoAccion tipoAccion;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "estado_anterior")
    @Enumerated(EnumType.STRING)
    private Ticket.Estado estadoAnterior;

    @Column(name = "estado_nuevo")
    @Enumerated(EnumType.STRING)
    private Ticket.Estado estadoNuevo;

    @Column(name = "fecha_accion", updatable = false)
    private LocalDateTime fechaAccion;

    @PrePersist
    public void prePersist() {
        fechaAccion = LocalDateTime.now();
    }

    public enum TipoAccion {
        CREAR, ASIGNAR, MARCAR_RESUELTO, CERRAR, COMENTAR, ADJUNTAR_ARCHIVO
    }
}