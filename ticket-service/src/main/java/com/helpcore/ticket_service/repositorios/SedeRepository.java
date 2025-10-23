package com.helpcore.ticket_service.repositorios;

import com.helpcore.ticket_service.entidades.Sede;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SedeRepository extends JpaRepository<Sede, Integer> {
    List<Sede> findByActivoTrue();
}