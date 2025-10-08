package com.helpcore.ticket_service.repositorios;

import com.helpcore.ticket_service.entidades.Invitado;
import com.helpcore.ticket_service.entidades.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {
}
