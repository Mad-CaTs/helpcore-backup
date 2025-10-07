package com.helpcore.repositorios;

import com.helpcore.entidades.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Integer> {

    @Query("SELECT m FROM Menu m WHERE m.activo = true")
    List<Menu> listarActivos();
}
