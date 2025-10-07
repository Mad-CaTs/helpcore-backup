package com.helpcore.notification_service.controlador;

import com.helpcore.notification_service.dto.EmailVerificationDto;
import com.helpcore.notification_service.dto.EmailVerificationRequestDto;
import com.helpcore.notification_service.servicios.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/verification")
@RequiredArgsConstructor
public class VerificationController {
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/enviar-correo")
    public ResponseEntity<String> sendCode(@RequestBody EmailVerificationDto request) {
        try {
            emailVerificationService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok("Código de verificación enviado a " + request.getEmail());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/validar-codigo")
    public ResponseEntity<Map<String, Object>> validateCode(@RequestBody EmailVerificationRequestDto request) {
        boolean isValid = emailVerificationService.validateCode(request.getEmail(), request.getCode());

        Map<String, Object> response = new HashMap<>();
        response.put("success", isValid);
        response.put("message", isValid ? "Código válido, correo verificado con éxito."
                : "Código incorrecto o expirado.");

        return isValid ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }
}
