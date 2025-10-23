package com.helpcore.ticket_service.repositorios;

import com.helpcore.ticket_service.entidades.RespuestaTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespuestaTicketRepository extends JpaRepository<RespuestaTicket, Integer> {

    @Query("SELECT r FROM RespuestaTicket r WHERE r.ticket.id = :idTicket AND r.activo = true ORDER BY r.fechaCreacion ASC")
    List<RespuestaTicket> obtenerRespuestasPorTicket(@Param("idTicket") Integer idTicket);

    @Query("SELECT COUNT(r) FROM RespuestaTicket r WHERE r.ticket.id = :idTicket AND r.activo = true")
    long contarRespuestasPorTicket(@Param("idTicket") Integer idTicket);
}