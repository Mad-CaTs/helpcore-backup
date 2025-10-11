package com.helpcore.entidades.dto.login;

import lombok.Data;

@Data
public class UsuarioRegisterDTO {
    private String nombres;
    private String apellidos;
    private String dni;
    private String telefono;
    private String codigo;
    private String sede;
    private String correo;
    private String contrasena;
}
