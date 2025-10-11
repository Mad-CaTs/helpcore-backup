package com.helpcore.controladores;

import com.helpcore.entidades.Rol;
import com.helpcore.entidades.dto.CategoriaTicketDTO;
import com.helpcore.servicios.CategoriaRolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/rol-categoria")
public class CategoriaRolController {

    @Autowired
    private CategoriaRolService categoriaRolService;

    /**
     * Asigna categorías a un rol (reemplaza las existentes)
     * POST /rol-categoria/{idRol}/asignar
     */
    @PostMapping("/{idRol}/asignar")
    public ResponseEntity<?> asignarCategoriasARol(
            @PathVariable Integer idRol,
            @RequestBody List<Integer> categoriasIds) {
        try {
            Rol rolActualizado = categoriaRolService.asignarCategoriasARol(idRol, categoriasIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Categorías asignadas correctamente");
            response.put("rol", rolActualizado);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Agrega categorías adicionales a un rol (mantiene las existentes)
     * POST /rol-categoria/{idRol}/agregar
     */
    @PostMapping("/{idRol}/agregar")
    public ResponseEntity<?> agregarCategoriasARol(
            @PathVariable Integer idRol,
            @RequestBody List<Integer> categoriasIds) {
        try {
            Rol rolActualizado = categoriaRolService.agregarCategoriasARol(idRol, categoriasIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Categorías agregadas correctamente");
            response.put("rol", rolActualizado);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Remueve categorías específicas de un rol
     * DELETE /rol-categoria/{idRol}/remover
     */
    @DeleteMapping("/{idRol}/remover")
    public ResponseEntity<?> removerCategoriasDeRol(
            @PathVariable Integer idRol,
            @RequestBody List<Integer> categoriasIds) {
        try {
            Rol rolActualizado = categoriaRolService.removerCategoriasDeRol(idRol, categoriasIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Categorías removidas correctamente");
            response.put("rol", rolActualizado);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Obtiene todas las categorías de un rol
     * GET /rol-categoria/{idRol}/categorias
     */
    @GetMapping("/{idRol}/categorias")
    public ResponseEntity<?> obtenerCategoriasPorRol(@PathVariable Integer idRol) {
        try {
            List<CategoriaTicketDTO> categorias = categoriaRolService.obtenerCategoriasPorRol(idRol);
            return ResponseEntity.ok(categorias);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Obtiene solo las categorías padre de un rol
     * GET /rol-categoria/{idRol}/categorias/padres
     */
    @GetMapping("/{idRol}/categorias/padres")
    public ResponseEntity<?> obtenerCategoriasPadre(@PathVariable Integer idRol) {
        try {
            List<CategoriaTicketDTO> categorias = categoriaRolService.obtenerCategoriasPadrePorRol(idRol);
            return ResponseEntity.ok(categorias);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Obtiene solo las categorías hijas de un rol
     * GET /rol-categoria/{idRol}/categorias/hijas
     */
    @GetMapping("/{idRol}/categorias/hijas")
    public ResponseEntity<?> obtenerCategoriasHijas(@PathVariable Integer idRol) {
        try {
            List<CategoriaTicketDTO> categorias = categoriaRolService.obtenerCategoriasHijasPorRol(idRol);
            return ResponseEntity.ok(categorias);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Verifica si un rol tiene acceso a una categoría
     * GET /rol-categoria/{idRol}/tiene-acceso/{idCategoria}
     */
    @GetMapping("/{idRol}/tiene-acceso/{idCategoria}")
    public ResponseEntity<Map<String, Object>> verificarAccesoACategoria(
            @PathVariable Integer idRol,
            @PathVariable Integer idCategoria) {
        Map<String, Object> response = new HashMap<>();
        boolean tieneAcceso = categoriaRolService.rolTieneAccesoACategoria(idRol, idCategoria);
        response.put("tieneAcceso", tieneAcceso);
        response.put("idRol", idRol);
        response.put("idCategoria", idCategoria);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene todos los roles que tienen acceso a una categoría
     * GET /rol-categoria/por-categoria/{idCategoria}
     */
    @GetMapping("/por-categoria/{idCategoria}")
    public ResponseEntity<List<Rol>> obtenerRolesPorCategoria(@PathVariable Integer idCategoria) {
        List<Rol> roles = categoriaRolService.obtenerRolesPorCategoria(idCategoria);
        return ResponseEntity.ok(roles);
    }
}