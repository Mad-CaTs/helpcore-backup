package com.helpcore.ticket_service.entidades;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_sede")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sede")
    private Integer id;

    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    @Column(nullable = false)
    private boolean activo = true;
}