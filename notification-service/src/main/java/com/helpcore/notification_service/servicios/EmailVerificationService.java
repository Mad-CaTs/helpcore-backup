package com.helpcore.notification_service.servicios;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
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

    private static final long CODIGO_TLL_MINUTOS = 2;

    public void sendVerificationCode(String email) throws Exception {
        String codigoValidoActivo = redisTemplate.opsForValue().get(email);
        if (codigoValidoActivo != null) {
            throw new Exception("No puedes generar un nuevo código: aún tienes un código válido.");
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
    }

    public boolean validateCode(String email, String code) {
        String stored = redisTemplate.opsForValue().get(email);
        return stored != null && stored.equals(code);
    }
}
