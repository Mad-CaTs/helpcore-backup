package com.helpcore.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token {

    public enum TipoToken{
        BEARER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Integer id;

    @Column(name = "token", length = 500, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    public TipoToken tipoToken = TipoToken.BEARER;

    @Column(name = "removido")
    private boolean removido;

    @Column(name = "expirado")
    private boolean expirado;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
    }
}