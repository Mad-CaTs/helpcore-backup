package com.helpcore.ticket_service.controladores;

import com.helpcore.ticket_service.entidades.Sede;
import com.helpcore.ticket_service.servicios.SedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sede")
@RequiredArgsConstructor
public class SedeController {

    private final SedeService sedeService;

    @GetMapping("/listar")
    public ResponseEntity<List<Sede>> listar() {
        return ResponseEntity.ok(sedeService.listarActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sede> buscarPorId(@PathVariable Integer id) {
        Sede sede = sedeService.buscarPorId(id);
        if (sede != null) {
            return ResponseEntity.ok(sede);
        }
        return ResponseEntity.notFound().build();
    }
}