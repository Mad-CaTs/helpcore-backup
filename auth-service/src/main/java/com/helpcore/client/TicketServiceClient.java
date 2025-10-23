package com.helpcore.client;

import com.helpcore.entidades.dto.CategoriaTicketDTO;
import com.helpcore.entidades.dto.SedeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "ticket-service", url = "${ticket.service.url:http://localhost:8082}")
public interface TicketServiceClient {

    @GetMapping("/categoria-ticket/listar")
    List<CategoriaTicketDTO> listarCategorias();

    @GetMapping("/categoria-ticket/buscar/{id}")
    CategoriaTicketDTO buscarCategoriaPorId(@PathVariable("id") Integer id);

    @GetMapping("/categoria-ticket/buscar-por-ids")
    List<CategoriaTicketDTO> buscarCategoriasPorIds(@RequestParam("ids") List<Integer> ids);

    @GetMapping("/sede/{id}")
    ResponseEntity<SedeDTO> obtenerSedePorId(@PathVariable("id") Integer id);
}