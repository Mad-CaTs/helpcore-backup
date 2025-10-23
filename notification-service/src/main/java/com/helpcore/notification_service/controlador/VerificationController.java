package com.helpcore.notification_service.controlador;

import com.helpcore.notification_service.dto.EmailVerificationDto;
import com.helpcore.notification_service.dto.EmailVerificationRequestDto;
import com.helpcore.notification_service.servicios.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<Map<String, String>> sendCode(@RequestBody EmailVerificationDto request) {
        Map<String, String> response = new HashMap<>();
        try {
            String message = emailVerificationService.sendVerificationCode(request.getEmail());
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            if (e.getMessage().contains("correo ya está registrado")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.badRequest().body(response);
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

    @PostMapping("/consultar-ticket/{codigoTicket}")
    public ResponseEntity<Map<String, String>> sendCodeByTicket(@PathVariable String codigoTicket) {
        Map<String, String> response = new HashMap<>();
        try {
            String message = emailVerificationService.sendVerificationCodeByTicketCode(codigoTicket);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/validar-codigo/{codigoTicket}")
    public ResponseEntity<Map<String, Object>> validateCodeByTicket(@PathVariable String codigoTicket, @RequestBody Map<String, String> request) {
        String code = request.get("code");

        String email = emailVerificationService.getEmailByTicketCode(codigoTicket);

        boolean isValid = emailVerificationService.validateCode(email, code);

        Map<String, Object> response = new HashMap<>();
        response.put("success", isValid);
        response.put("message", isValid
                ? "Código válido, correo verificado con éxito."
                : "Código incorrecto o expirado.");

        return isValid
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }
}
