package com.helpcore.ticket_service.entidades;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tb_categoria_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria_padre")
    @JsonIgnoreProperties({"subcategorias", "categoriaPadre"})
    private CategoriaTicket categoriaPadre;

    @OneToMany(mappedBy = "categoriaPadre", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"categoriaPadre", "subcategorias"})
    private List<CategoriaTicket> subcategorias;

    @PrePersist
    public void prePersist() {
        activo = true;
    }

    public boolean esPadre() {
        return categoriaPadre == null;
    }
}