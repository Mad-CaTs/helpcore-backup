package com.helpcore.controladores;

import com.helpcore.entidades.Menu;
import com.helpcore.entidades.Rol;
import com.helpcore.servicios.RolMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/rol-menu")
public class RolMenuController {

    @Autowired
    private RolMenuService rolMenuService;

    @PutMapping("/asignar/{rolId}")
    public ResponseEntity<?> asignarMenus(
            @PathVariable Integer rolId,
            @RequestBody List<Integer> menuIds) {
        try {
            Rol rol = rolMenuService.asignarMenus(rolId, menuIds);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Menús asignados correctamente");
            resp.put("rol", rol);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
    }

    @PostMapping("/agregar/{rolId}/menu/{menuId}")
    public ResponseEntity<?> agregarMenu(
            @PathVariable Integer rolId,
            @PathVariable Integer menuId) {
        try {
            Rol rol = rolMenuService.agregarMenu(rolId, menuId);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Menú agregado correctamente");
            resp.put("rol", rol);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
    }

    @DeleteMapping("/quitar/{rolId}/menu/{menuId}")
    public ResponseEntity<?> quitarMenu(
            @PathVariable Integer rolId,
            @PathVariable Integer menuId) {
        try {
            Rol rol = rolMenuService.quitarMenu(rolId, menuId);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Menú removido correctamente");
            resp.put("rol", rol);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
    }

    @GetMapping("/{rolId}/menus")
    public ResponseEntity<?> obtenerMenusPorRol(@PathVariable Integer rolId) {
        try {
            List<Menu> menus = rolMenuService.obtenerMenusPorRol(rolId);
            return ResponseEntity.ok(menus);
        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        }
    }

    @GetMapping("/{rolId}/menus-disponibles")
    public ResponseEntity<?> obtenerMenusDisponibles(@PathVariable Integer rolId) {
        try {
            List<Menu> menus = rolMenuService.obtenerMenusDisponibles(rolId);
            return ResponseEntity.ok(menus);
        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        }
    }
}