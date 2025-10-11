package com.helpcore.controladores;

import com.helpcore.entidades.Menu;
import com.helpcore.servicios.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/listar")
    public ResponseEntity<List<Menu>> listar() {
        return ResponseEntity.ok(menuService.listar());
    }

    @GetMapping("/listar/usuario")
    public ResponseEntity<List<Menu>> listarPorUsuario(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        String correo = authentication.getName();
        List<Menu> menus = menuService.listarPorCorreo(correo);
        return ResponseEntity.ok(menus);
    }

    @PostMapping("/crear")
    public ResponseEntity<Menu> crear(@RequestBody Menu menu) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.crear(menu));
    }

    @PutMapping("/actualizar")
    public ResponseEntity<Menu> actualizar(@RequestBody Menu menu) {
        Menu actualizado = menuService.actualizar(menu);
        if (actualizado != null) return ResponseEntity.ok(actualizado);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        Map<String, Object> resp = new HashMap<>();
        if (menuService.eliminar(id)) {
            resp.put("success", true);
            resp.put("message", "Menú eliminado (borrado lógico)");
            return ResponseEntity.ok(resp);
        } else {
            resp.put("success", false);
            resp.put("message", "Menú no encontrado o ya inactivo");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        }
    }
}
