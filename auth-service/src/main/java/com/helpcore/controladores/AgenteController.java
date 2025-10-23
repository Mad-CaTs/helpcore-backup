package com.helpcore.controladores;


import com.helpcore.entidades.Usuario;
import com.helpcore.entidades.dto.CrearAgenteRequest;
import com.helpcore.entidades.dto.EditarAgenteRequest;
import com.helpcore.servicios.AgenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/agente")
public class AgenteController {

    @Autowired
    private AgenteService agenteService;

    @GetMapping("/listar")
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(agenteService.listarAgentes());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody CrearAgenteRequest request) {
        try {
            Usuario nuevoAgente = agenteService.crearAgente(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAgente);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody EditarAgenteRequest request) {
        try {
            Usuario agenteActualizado = agenteService.editarAgente(id, request);
            return ResponseEntity.ok(agenteActualizado);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/deshabilitar/{id}")
    public ResponseEntity<?> deshabilitar(@PathVariable Integer id) {
        try {
            agenteService.deshabilitarAgente(id);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("success", "true");
            respuesta.put("message", "Agente deshabilitado correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Integer id) {
        try {
            Usuario agente = agenteService.obtenerAgente(id);
            return ResponseEntity.ok(agente);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}