package com.helpcore.repositorios;

import com.helpcore.entidades.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    @Query("SELECT r FROM Rol r WHERE r.activo = true")
    List<Rol> listarActivos();

    Optional<Rol> findByNombre(String nombre);

    List<Rol> findByActivoTrue();

    Optional<Rol> findByIdAndActivoTrue(Integer id);

    boolean existsByNombreAndActivoTrue(String nombre);

    Optional<Rol> findByNombreAndActivoTrue(String nombre);

    @Query("SELECT r FROM Rol r LEFT JOIN FETCH r.menus WHERE r.id = :id AND r.activo = true")
    Optional<Rol> findByIdWithMenus(@Param("id") Integer id);

}
