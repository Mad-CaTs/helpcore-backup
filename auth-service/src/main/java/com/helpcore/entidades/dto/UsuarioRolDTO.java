package com.helpcore.entidades.dto;

import com.helpcore.entidades.Persona;
import com.helpcore.entidades.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioRolDTO {

    private Integer id;
    private String correo;
    private PersonaDTO persona;
    private List<RolSimpleDTO> roles;
    private boolean activo;
    private LocalDateTime fechaCreacion;

    public static UsuarioRolDTO fromEntity(Usuario usuario) {
        Persona persona = usuario.getPersona();
        return UsuarioRolDTO.builder()
                .id(usuario.getId())
                .correo(usuario.getCorreo())
                .persona(PersonaDTO.builder()
                        .id(persona.getId())
                        .nombres(persona.getNombres())
                        .apellidos(persona.getApellidos())
                        .dni(persona.getDni())
                        .telefono(persona.getTelefono())
                        .codigoAlumno(persona.getCodigoAlumno())
                        .idSede(persona.getIdSede())
                        .activo(persona.isActivo())
                        .fechaCreacion(persona.getFechaCreacion())
                        .build())
                .roles(usuario.getRoles() != null
                        ? usuario.getRoles().stream()
                        .map(RolSimpleDTO::fromEntity)
                        .collect(Collectors.toList())
                        : List.of())
                .activo(usuario.isActivo())
                .fechaCreacion(usuario.getFechaCreacion())
                .build();
    }

    public static List<UsuarioRolDTO> fromEntityList(List<Usuario> usuarios) {
        return usuarios.stream()
                .map(UsuarioRolDTO::fromEntity)
                .collect(Collectors.toList());
    }
}