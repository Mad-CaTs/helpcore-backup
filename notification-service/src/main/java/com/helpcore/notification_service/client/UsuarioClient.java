package com.helpcore.notification_service.client;

import com.helpcore.notification_service.dto.UsuarioResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service")
public interface UsuarioClient {
    @GetMapping("/usuario/{id}")
    UsuarioResponse obtenerUsuarioPorId(@PathVariable Integer id);
    @GetMapping("/usuario/correo/{email}")
    ResponseEntity<UsuarioResponse> obtenerUsuarioPorCorreo(@PathVariable String email);
}