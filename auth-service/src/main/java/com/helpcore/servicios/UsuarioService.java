package com.helpcore.servicios;

import com.helpcore.entidades.Rol;
import com.helpcore.entidades.Usuario;
import com.helpcore.repositorios.RolRepository;
import com.helpcore.repositorios.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Transactional
    public Usuario asignarRol(Integer idUsuario, Integer idRol) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));

        if (!usuario.getRoles().contains(rol)) {
            usuario.getRoles().add(rol);
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario removerRol(Integer idUsuario, Integer idRol) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));

        usuario.getRoles().remove(rol);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario reemplazarRoles(Integer idUsuario, List<Integer> nuevosRoles) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        List<Rol> roles = rolRepository.findAllById(nuevosRoles);
        usuario.setRoles(roles);

        return usuarioRepository.save(usuario);
    }

    public List<Rol> listarRolesDeUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return usuario.getRoles()
                .stream()
                .filter(Rol::isActivo)
                .toList();
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .toList();
    }

}
