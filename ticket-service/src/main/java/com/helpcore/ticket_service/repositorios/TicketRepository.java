package com.helpcore.ticket_service.repositorios;

import com.helpcore.ticket_service.entidades.Invitado;
import com.helpcore.ticket_service.entidades.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findByIdUsuarioCliente(Integer idUsuarioCliente);
    @Query("SELECT t FROM Ticket t WHERE t.categoria.id IN :categoriasIds AND t.activo = true")
    List<Ticket> findByCategoriaIdIn(@Param("categoriasIds") List<Integer> categoriasIds);
    List<Ticket> findByIdUsuarioAgente(Integer idUsuarioAgente);
    List<Ticket> findByActivoTrue();
    boolean existsByCodigoTicket(String codigoTicket);
    Optional<Ticket> findByCodigoTicket(String codigoTicket);
}
