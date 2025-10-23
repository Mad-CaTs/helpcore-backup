package com.helpcore.ticket_service.controladores;

import com.helpcore.ticket_service.entidades.CategoriaTicket;
import com.helpcore.ticket_service.entidades.dto.CategoriaTicketDTO;
import com.helpcore.ticket_service.entidades.dto.ResponseDTO;
import com.helpcore.ticket_service.servicios.CategoriaTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/categoria-ticket")
public class CategoriaTicketController {

    @Autowired
    private CategoriaTicketService categoriaTicketService;

    @GetMapping("/listar")
    public ResponseEntity<List<CategoriaTicketDTO>> listarCategoriaTicket() {
        try {
            List<CategoriaTicketDTO> categorias = categoriaTicketService.listarJerarquico();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/listar-todas")
    public ResponseEntity<List<CategoriaTicketDTO>> listarTodasCategorias() {
        try {
            List<CategoriaTicketDTO> categorias = categoriaTicketService.listarTodasJerarquico();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaTicketDTO> obtenerCategoria(@PathVariable Integer id) {
        try {
            CategoriaTicketDTO categoria = categoriaTicketService.obtenerPorId(id);
            if (categoria == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(categoria);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Buscar múltiples categorías por sus IDs
     */
    @GetMapping("/buscar-por-ids")
    public ResponseEntity<List<CategoriaTicketDTO>> buscarCategoriasPorIds(
            @RequestParam("ids") List<Integer> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<CategoriaTicketDTO> categorias = categoriaTicketService.buscarPorIds(ids);
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<ResponseDTO> crearCategoria(@RequestBody CategoriaTicketDTO categoriaDTO) {
        try {
            CategoriaTicket categoriaCreada = categoriaTicketService.crear(categoriaDTO);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .success(true)
                    .message("Categoría creada correctamente")
                    .data(categoriaCreada)
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .success(false)
                            .message("Error al crear la categoría: " + e.getMessage())
                            .build());
        }
    }

    @PutMapping("/actualizar")
    public ResponseEntity<ResponseDTO> actualizarCategoria(@RequestBody CategoriaTicketDTO categoriaDTO) {
        try {
            if (categoriaDTO.getId() == null) {
                return ResponseEntity.badRequest().body(ResponseDTO.builder()
                        .success(false)
                        .message("El ID de la categoría es requerido")
                        .build());
            }

            CategoriaTicket categoriaActualizada = categoriaTicketService.actualizar(categoriaDTO);

            CategoriaTicketDTO resultadoDTO = categoriaTicketService.obtenerPorIdCompleto(categoriaActualizada.getId());

            return ResponseEntity.ok(ResponseDTO.builder()
                    .success(true)
                    .message("Categoría actualizada correctamente")
                    .data(resultadoDTO)
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .success(false)
                            .message("Error al actualizar la categoría: " + e.getMessage())
                            .build());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<ResponseDTO> eliminarCategoria(@PathVariable Integer id) {
        try {
            categoriaTicketService.eliminar(id);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .success(true)
                    .message("Categoría deshabilitada correctamente")
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .success(false)
                            .message("Error al eliminar la categoría: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/listar-padres")
    public ResponseEntity<List<CategoriaTicketDTO>> listarCategoriasPadre() {
        try {
            List<CategoriaTicketDTO> categorias = categoriaTicketService.listarCategoriasPadre();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}