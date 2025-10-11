package com.helpcore.controladores;

import com.helpcore.entidades.Rol;
import com.helpcore.servicios.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/rol")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping("/listar")
    public ResponseEntity<List<Rol>> listar() {
        return ResponseEntity.ok(rolService.listar());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Rol rol) {
        try {
            Rol nuevoRol = rolService.crear(rol);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/actualizar")
    public ResponseEntity<Rol> actualizar(@RequestBody Rol rol) {
        Rol actualizado = rolService.actualizar(rol);
        if (actualizado != null) return ResponseEntity.ok(actualizado);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        Map<String, Object> resp = new HashMap<>();
        if (rolService.eliminar(id)) {
            resp.put("success", true);
            resp.put("message", "Rol eliminado (borrado lógico)");
            return ResponseEntity.ok(resp);
        } else {
            resp.put("success", false);
            resp.put("message", "Rol no encontrado o ya inactivo");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        }
    }
}
