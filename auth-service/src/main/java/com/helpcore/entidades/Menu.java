package com.helpcore.entidades;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tb_menu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_menu")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String ruta;

    @Column(length = 100)
    private String icono;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_menu_padre")
    private Menu menuPadre;

    @OneToMany(mappedBy = "menuPadre", fetch = FetchType.LAZY)
    private List<Menu> submenus;

    @Column(name = "activo", nullable = false)
    private boolean activo;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        activo = true;
    }

    @ManyToMany(mappedBy = "menus")
    private List<Rol> roles;
}
