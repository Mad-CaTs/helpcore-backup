package com.helpcore.ticket_service.repositorios;

import com.helpcore.ticket_service.entidades.CategoriaTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaTicketRepository extends JpaRepository<CategoriaTicket,Integer> {
    List<CategoriaTicket> findByActivoTrue();

    List<CategoriaTicket> findByActivoTrueAndCategoriaPadreIsNull();

    List<CategoriaTicket> findByCategoriaPadreId(Integer idPadre);

    List<CategoriaTicket> findByCategoriaPadreIdAndActivoTrue(Integer idPadre);
}
