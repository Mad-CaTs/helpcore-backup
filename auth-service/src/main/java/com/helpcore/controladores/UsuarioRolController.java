package com.helpcore.controladores;

import com.helpcore.dto.UsuarioRolDTO;
import com.helpcore.entidades.Usuario;
import com.helpcore.servicios.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario-rol")
public class UsuarioRolController {

    private final UsuarioService usuarioService;

    public UsuarioRolController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/asignar")
    public ResponseEntity<UsuarioRolDTO> asignarRol(
            @RequestParam Integer idUsuario,
            @RequestParam Integer idRol) {
        Usuario usuario = usuarioService.asignarRol(idUsuario, idRol);
        return ResponseEntity.ok(UsuarioRolDTO.fromEntity(usuario));
    }

    @DeleteMapping("/remover")
    public ResponseEntity<UsuarioRolDTO> removerRol(
            @RequestParam Integer idUsuario,
            @RequestParam Integer idRol) {
        Usuario usuario = usuarioService.removerRol(idUsuario, idRol);
        return ResponseEntity.ok(UsuarioRolDTO.fromEntity(usuario));
    }

    @PutMapping("/editar")
    public ResponseEntity<UsuarioRolDTO> editarRoles(
            @RequestParam Integer idUsuario,
            @RequestBody List<Integer> nuevosRoles) {
        Usuario usuario = usuarioService.reemplazarRoles(idUsuario, nuevosRoles);
        return ResponseEntity.ok(UsuarioRolDTO.fromEntity(usuario));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<UsuarioRolDTO>> listarRoles() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.ok(UsuarioRolDTO.fromEntityList(usuarios));
    }
}