package com.helpcore.auth_service.controladores;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpcore.auth_service.entidades.dto.login.TokenResponseDTO;
import com.helpcore.auth_service.entidades.dto.login.UsuarioLoginDTO;
import com.helpcore.auth_service.entidades.dto.login.UsuarioRegisterDTO;
import com.helpcore.auth_service.servicios.AuthService;

import org.springframework.http.HttpHeaders;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin( origins = "http://localhost:4200/")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<TokenResponseDTO> register(@RequestBody final UsuarioRegisterDTO request) {
        System.out.println("=== AUTH-SERVICE CONTROLLER: /register RECIBIDO ===");
        System.out.println("Usuario: " + request.getNombreUsuario());
        System.out.println("Password: " + request.getContrasena());

        try {
            final TokenResponseDTO token = authService.registrar(request);
            System.out.println("=== REGISTRO EXITOSO ===");
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            System.out.println("=== ERROR EN REGISTRO: " + e.getMessage() + " ===");
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody final UsuarioLoginDTO request) {
        System.out.println("=== AUTH-SERVICE CONTROLLER: /login RECIBIDO ===");
        System.out.println("Usuario: " + request.getNombreUsuario());

        try {
            final TokenResponseDTO token = authService.login(request);
            System.out.println("=== LOGIN EXITOSO ===");
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            System.out.println("=== ERROR EN LOGIN: " + e.getMessage() + " ===");
            e.printStackTrace();
            throw e;
        }
    }

   @PostMapping("/refresh")
    public TokenResponseDTO refresh(@RequestHeader(HttpHeaders.AUTHORIZATION) final String authHeader) {
       return authService.refreshToken(authHeader);
   } 
}
