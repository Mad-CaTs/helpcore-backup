package com.helpcore.notification_service.servicios;

import com.helpcore.notification_service.client.UsuarioClient;
import com.helpcore.notification_service.dto.PersonaResponse;
import com.helpcore.notification_service.dto.TicketCreatedDto;
import com.helpcore.notification_service.dto.UsuarioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final UsuarioClient usuarioClient;

    public String sendTicketCreatedEmails(TicketCreatedDto ticket, String soporte) {
        // El código YA viene en el ticket desde ticket-service
        String codigoTicket = ticket.getCodigoTicket();

        if (codigoTicket == null || codigoTicket.isEmpty()) {
            throw new IllegalArgumentException("El ticket debe tener un código asignado");
        }

        String subject = "Nuevo ticket creado: " + ticket.getAsunto() + " (Código: " + codigoTicket + ")";

        sendEmailWithTemplate(
                ticket.getCorreoInvitado(),
                subject,
                ticket,
                "✅ Por favor, atento a su ticket, se le dará respuesta pronto."
        );

        sendEmailWithTemplate(
                soporte,
                subject,
                ticket,
                "✅ Por favor, revise el ticket lo antes posible"
        );

        return codigoTicket; // Retornar el código recibido
    }

    public String sendTicketCreatedEmailUsuario(Integer idUsuario, TicketCreatedDto ticket, String soporte) {
        UsuarioResponse usuario = usuarioClient.obtenerUsuarioPorId(idUsuario);
        PersonaResponse persona = usuario.getPersona();

        ticket.setNombres(persona.getNombres());
        ticket.setApellidos(persona.getApellidos());
        ticket.setDni(persona.getDni());
        ticket.setTelefono(persona.getTelefono());
        ticket.setCorreoInvitado(usuario.getCorreo());
        ticket.setCodigoAlumno(persona.getCodigoAlumno());
        if (ticket.getSede() == null || ticket.getSede().isEmpty()) {
            ticket.setSede(persona.getSede());
        }

        return sendTicketCreatedEmails(ticket, soporte);
    }

    private void sendEmailWithTemplate(String destinatario, String subject, TicketCreatedDto ticket, String mensajePersonalizado) {
        Context context = new Context();
        context.setVariable("codigoTicket", ticket.getCodigoTicket());
        context.setVariable("nombres", ticket.getNombres());
        context.setVariable("apellidos", ticket.getApellidos());
        context.setVariable("dni", ticket.getDni());
        context.setVariable("telefono", ticket.getTelefono());
        context.setVariable("email", ticket.getCorreoInvitado());
        context.setVariable("codigoAlumno", ticket.getCodigoAlumno());
        context.setVariable("sede", ticket.getSede());
        context.setVariable("categoria", ticket.getCategoria());
        context.setVariable("asunto", ticket.getAsunto());
        context.setVariable("comentarios", ticket.getComentarios());
        context.setVariable("mensajePersonalizado", mensajePersonalizado);

        String body = templateEngine.process("ticket-created", context);

        MimeMessagePreparator message = mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(destinatario);
            helper.setSubject(subject);
            helper.setText(body, true);
        };

        mailSender.send(message);
    }
}