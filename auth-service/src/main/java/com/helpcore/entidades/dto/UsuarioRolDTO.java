package com.helpcore.dto;

import com.helpcore.entidades.Usuario;
import com.helpcore.entidades.dto.RolSimpleDTO;
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
    private String nombres;
    private String apellidos;
    private String dni;
    private String telefono;
    private String codigoAlumno;
    private String sede;
    private String correo;
    private List<RolSimpleDTO> roles;
    private boolean activo;
    private LocalDateTime fechaCreacion;

    public static UsuarioRolDTO fromEntity(Usuario usuario) {
        return UsuarioRolDTO.builder()
                .id(usuario.getId())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .dni(usuario.getDni())
                .telefono(usuario.getTelefono())
                .codigoAlumno(usuario.getCodigoAlumno())
                .sede(usuario.getSede())
                .correo(usuario.getCorreo())
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