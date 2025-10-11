package com.helpcore.repositorios;

import com.helpcore.entidades.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Integer> {

    @Query("SELECT m FROM Menu m WHERE m.activo = true")
    List<Menu> listarActivos();

    List<Menu> findByActivoTrue();

    Optional<Menu> findByIdAndActivoTrue(Integer id);

    @Query("SELECT m FROM Menu m WHERE m.menuPadre IS NULL AND m.activo = true")
    List<Menu> findMenusPrincipales();

    List<Menu> findByMenuPadreIdAndActivoTrue(Integer menuPadreId);

    boolean existsByNombreAndActivoTrue(String nombre);
}
