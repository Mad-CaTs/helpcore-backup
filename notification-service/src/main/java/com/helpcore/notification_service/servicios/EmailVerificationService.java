package com.helpcore.notification_service.servicios;

import com.helpcore.notification_service.client.TicketClient;
import com.helpcore.notification_service.client.UsuarioClient;
import com.helpcore.notification_service.dto.ConsultarTicketResponseDto;
import com.helpcore.notification_service.dto.UsuarioResponse;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final RedisTemplate<String, String> redisTemplate;
    private final SecureRandom random = new SecureRandom();
    private final TicketClient ticketClient;
    private final UsuarioClient usuarioClient;

    private static final long CODIGO_TLL_MINUTOS = 2;

    public String sendVerificationCode(String email) throws Exception {
        try {
            ResponseEntity<UsuarioResponse> response = usuarioClient.obtenerUsuarioPorCorreo(email);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                throw new RuntimeException("Este correo ya está registrado en el sistema. Por favor, inicia sesión para crear un ticket.");
            }
        } catch (Exception e) {
            if (e.getMessage().contains("correo ya está registrado")) {
                throw e;
            }
            System.out.println("Error al verificar usuario: " + e.getMessage());
        }

        String codigoValidoActivo = redisTemplate.opsForValue().get(email);
        if (codigoValidoActivo != null) {
            return "Aún tienes un código válido, ingresa tu código";
        }

        String code = String.valueOf(100000 + random.nextInt(900000));
        redisTemplate.opsForValue().set(email, code, Duration.ofMinutes(CODIGO_TLL_MINUTOS));

        Context context = new Context();
        context.setVariable("email", email);
        context.setVariable("code", code);

        String body = templateEngine.process("codigo-verificated", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email);
        helper.setSubject("Código de verificación");
        helper.setText(body, true);

        mailSender.send(message);
        return "Código de verificación enviado a " + email;
    }

    public boolean validateCode(String email, String code) {
        String stored = redisTemplate.opsForValue().get(email);
        return stored != null && stored.equals(code);
    }

    public String sendVerificationCodeByTicketCode(String codigoTicket) throws Exception {
        ConsultarTicketResponseDto ticket = ticketClient.obtenerPorCodigo(codigoTicket);

        if (ticket == null || ticket.getCorreoInvitado() == null) {
            throw new Exception("No se encontró correo_invitado para el ticket: " + codigoTicket);
        }

        String email = ticket.getCorreoInvitado();
        return sendVerificationCode(email);
    }

    public String getEmailByTicketCode(String codigoTicket) {
        ConsultarTicketResponseDto ticket = ticketClient.obtenerPorCodigo(codigoTicket);

        if (ticket == null || ticket.getCorreoInvitado() == null) {
            throw new RuntimeException("No se encontró correo_invitado para el ticket: " + codigoTicket);
        }

        return ticket.getCorreoInvitado();
    }
}
