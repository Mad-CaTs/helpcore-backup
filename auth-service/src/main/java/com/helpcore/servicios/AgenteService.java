package com.helpcore.servicios;

import com.helpcore.entidades.Persona;
import com.helpcore.entidades.Rol;
import com.helpcore.entidades.Usuario;
import com.helpcore.entidades.dto.CrearAgenteRequest;
import com.helpcore.entidades.dto.EditarAgenteRequest;
import com.helpcore.repositorios.PersonaRepository;
import com.helpcore.repositorios.RolRepository;
import com.helpcore.repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AgenteService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Integer ROLE_AGENTE_CAPACITACION_ID = 3;

    @Transactional
    public List<Usuario> listarAgentes() {
        Rol rolAgente = rolRepository.findById(ROLE_AGENTE_CAPACITACION_ID)
                .orElseThrow(() -> new RuntimeException("Rol de agente no encontrado"));

        return usuarioRepository.findByRolesContaining(rolAgente);
    }

    @Transactional
    public Usuario crearAgente(CrearAgenteRequest request) {
        // Validar que el email no exista
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // Validar que el DNI no exista
        if (personaRepository.existsByDni(request.getDni())) {
            throw new RuntimeException("El DNI ya está registrado");
        }

        // Validar que el DNI tenga 8 dígitos
        if (request.getDni() == null || !request.getDni().matches("\\d{8}")) {
            throw new RuntimeException("El DNI debe contener exactamente 8 dígitos");
        }

        // Crear persona
        Persona persona = Persona.builder()
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .dni(request.getDni())
                .telefono(request.getTelefono())
                .build();

        persona = personaRepository.save(persona);

        // Crear usuario
        Usuario usuario = Usuario.builder()
                .correo(request.getCorreo())
                .contrasena(passwordEncoder.encode(request.getContrasena()))
                .persona(persona)
                .activo(true)
                .build();

        // Asignar rol de agente capacitación
        Rol rolAgente = rolRepository.findById(ROLE_AGENTE_CAPACITACION_ID)
                .orElseThrow(() -> new RuntimeException("Rol de agente capacitación no encontrado"));

        List<Rol> roles = new ArrayList<>();
        roles.add(rolAgente);
        usuario.setRoles(roles);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario editarAgente(Integer id, EditarAgenteRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agente no encontrado"));

        // Verificar que siga teniendo el rol de agente
        boolean tieneRolAgente = usuario.getRoles().stream()
                .anyMatch(r -> r.getId().equals(ROLE_AGENTE_CAPACITACION_ID));

        if (!tieneRolAgente) {
            throw new RuntimeException("El usuario no es un agente válido");
        }

        // Actualizar persona
        Persona persona = usuario.getPersona();
        persona.setNombres(request.getNombres());
        persona.setApellidos(request.getApellidos());
        persona.setTelefono(request.getTelefono());
        personaRepository.save(persona);

        // Actualizar usuario
        usuario.setActivo(request.isActivo());
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void deshabilitarAgente(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agente no encontrado"));

        // Verificar que sea un agente
        boolean tieneRolAgente = usuario.getRoles().stream()
                .anyMatch(r -> r.getId().equals(ROLE_AGENTE_CAPACITACION_ID));

        if (!tieneRolAgente) {
            throw new RuntimeException("El usuario no es un agente válido");
        }

        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario obtenerAgente(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agente no encontrado"));

        // Verificar que sea un agente
        boolean tieneRolAgente = usuario.getRoles().stream()
                .anyMatch(r -> r.getId().equals(ROLE_AGENTE_CAPACITACION_ID));

        if (!tieneRolAgente) {
            throw new RuntimeException("El usuario no es un agente válido");
        }

        return usuario;
    }
}