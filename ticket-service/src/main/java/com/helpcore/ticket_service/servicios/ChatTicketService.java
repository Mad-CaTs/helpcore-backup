package com.helpcore.ticket_service.servicios;

import com.helpcore.ticket_service.entidades.*;
import com.helpcore.ticket_service.entidades.dto.*;
import com.helpcore.ticket_service.repositorios.*;
import com.helpcore.ticket_service.client.AuthServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class ChatTicketService {

    @Autowired
    private RespuestaTicketRepository respuestaTicketRepository;

    @Autowired
    private ArchivoRespuestaRepository archivoRespuestaRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AuthServiceClient authServiceClient;

    @Value("${file.upload.dir:archivos/tickets}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final Set<String> TIPOS_MIME_PERMITIDOS = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain", "text/csv"
    );

    /**
     * Obtiene todos los mensajes del chat de un ticket
     */
    public ChatTicketDTO obtenerChatTicket(Integer idTicket, Integer idUsuarioActual) {
        log.info("Obteniendo chat para ticket: {}", idTicket);

        Ticket ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

        // Validar que el usuario tenga acceso al ticket
        validarAccesoTicket(ticket, idUsuarioActual);

        List<RespuestaTicket> respuestas = respuestaTicketRepository.obtenerRespuestasPorTicket(idTicket);

        List<MensajeDTO> mensajes = respuestas.stream()
                .map(r -> convertirRespuestaAMensajeDTO(r, idUsuarioActual))
                .collect(Collectors.toList());

        boolean ticketCerrado = ticket.getEstado() == Ticket.Estado.CERRADO;
        boolean usuarioPuedeMensajear = !ticketCerrado;

        return ChatTicketDTO.builder()
                .idTicket(idTicket)
                .estadoTicket(ticket.getEstado().toString())
                .ticketCerrado(ticketCerrado)
                .mensajes(mensajes)
                .usuarioPuedeMensajear(usuarioPuedeMensajear)
                .build();
    }

    /**
     * Crea un nuevo mensaje en el chat
     */
    public MensajeDTO crearMensaje(Integer idTicket, String mensaje, Integer idUsuario) {
        log.info("Creando mensaje en ticket: {} por usuario: {}", idTicket, idUsuario);

        Ticket ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

        // Validar que el ticket no esté cerrado
        if (ticket.getEstado() == Ticket.Estado.CERRADO) {
            throw new RuntimeException("No se pueden enviar mensajes en un ticket cerrado");
        }

        // Validar acceso
        validarAccesoTicket(ticket, idUsuario);

        // Validar mensaje
        if (mensaje == null || mensaje.trim().isEmpty()) {
            throw new RuntimeException("El mensaje no puede estar vacío");
        }

        if (mensaje.length() > 5000) {
            throw new RuntimeException("El mensaje no puede exceder 5000 caracteres");
        }

        // Determinar tipo de usuario
        RespuestaTicket.TipoUsuario tipoUsuario = determinarTipoUsuario(ticket, idUsuario);

        RespuestaTicket respuesta = RespuestaTicket.builder()
                .ticket(ticket)
                .idUsuario(idUsuario)
                .tipoUsuario(tipoUsuario)
                .mensaje(mensaje)
                .activo(true)
                .build();

        RespuestaTicket respuestaSaved = respuestaTicketRepository.save(respuesta);
        log.info("Mensaje creado exitosamente con ID: {}", respuestaSaved.getId());

        return convertirRespuestaAMensajeDTO(respuestaSaved, idUsuario);
    }

    /**
     * Adjunta un archivo a un mensaje
     */
    public ArchivoDTO adjuntarArchivo(Integer idRespuesta, MultipartFile file) throws IOException {
        log.info("Adjuntando archivo a respuesta: {}", idRespuesta);

        RespuestaTicket respuesta = respuestaTicketRepository.findById(idRespuesta)
                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada"));

        // Validar ticket no cerrado
        if (respuesta.getTicket().getEstado() == Ticket.Estado.CERRADO) {
            throw new RuntimeException("No se pueden adjuntar archivos en tickets cerrados");
        }

        // Validar archivo
        validarArchivo(file);

        // Generar nombre único para el archivo
        String nombreAlmacenado = generarNombreArchivoUnico(file.getOriginalFilename());
        String rutaCompleta = uploadDir + File.separator + respuesta.getTicket().getId() + File.separator + nombreAlmacenado;

        // Crear directorio si no existe
        Path directorio = Paths.get(uploadDir + File.separator + respuesta.getTicket().getId());
        Files.createDirectories(directorio);

        // Guardar archivo
        Path rutaArchivo = Paths.get(rutaCompleta);
        Files.write(rutaArchivo, file.getBytes());

        // Crear registro en BD
        ArchivoRespuesta archivo = ArchivoRespuesta.builder()
                .respuesta(respuesta)
                .nombreOriginal(file.getOriginalFilename())
                .nombreAlmacenado(nombreAlmacenado)
                .rutaArchivo(rutaCompleta)
                .tipoMime(file.getContentType())
                .tamaño(file.getSize())
                .esImagen(file.getContentType() != null && file.getContentType().startsWith("image/"))
                .activo(true)
                .build();

        ArchivoRespuesta archivoGuardado = archivoRespuestaRepository.save(archivo);
        log.info("Archivo adjuntado exitosamente: {}", nombreAlmacenado);

        return convertirArchivoADTO(archivoGuardado);
    }

    /**
     * Obtiene un archivo para descargar
     */
    public byte[] obtenerArchivo(Integer idArchivo) throws IOException {
        log.info("Obteniendo archivo: {}", idArchivo);

        ArchivoRespuesta archivo = archivoRespuestaRepository.findById(idArchivo)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));

        Path rutaArchivo = Paths.get(archivo.getRutaArchivo());
        return Files.readAllBytes(rutaArchivo);
    }

    // ============= MÉTODOS PRIVADOS =============

    private void validarAccesoTicket(Ticket ticket, Integer idUsuario) {
        if (!ticket.getIdUsuarioCliente().equals(idUsuario) &&
                !ticket.getIdUsuarioAgente().equals(idUsuario)) {
            throw new RuntimeException("No tienes acceso a este ticket");
        }
    }

    private RespuestaTicket.TipoUsuario determinarTipoUsuario(Ticket ticket, Integer idUsuario) {
        if (ticket.getIdUsuarioAgente().equals(idUsuario)) {
            return RespuestaTicket.TipoUsuario.AGENTE;
        } else if (ticket.getIdUsuarioCliente().equals(idUsuario)) {
            return RespuestaTicket.TipoUsuario.CLIENTE;
        }
        throw new RuntimeException("Usuario no pertenece a este ticket");
    }

    private MensajeDTO convertirRespuestaAMensajeDTO(RespuestaTicket respuesta, Integer idUsuarioActual) {
        List<ArchivoDTO> archivosDTO = new ArrayList<>();
        if (respuesta.getArchivos() != null) {
            archivosDTO = respuesta.getArchivos().stream()
                    .map(this::convertirArchivoADTO)
                    .collect(Collectors.toList());
        }

        return MensajeDTO.builder()
                .id(respuesta.getId())
                .idTicket(respuesta.getTicket().getId())
                .idUsuario(respuesta.getIdUsuario())
                .tipoUsuario(respuesta.getTipoUsuario().toString())
                .nombreUsuario(obtenerNombreUsuario(respuesta.getIdUsuario()))
                .correoUsuario(obtenerCorreoUsuario(respuesta.getIdUsuario()))
                .mensaje(respuesta.getMensaje())
                .fechaCreacion(respuesta.getFechaCreacion())
                .esDelUsuarioActual(respuesta.getIdUsuario().equals(idUsuarioActual))
                .archivos(archivosDTO)
                .build();
    }

    private ArchivoDTO convertirArchivoADTO(ArchivoRespuesta archivo) {
        return ArchivoDTO.builder()
                .id(archivo.getId())
                .nombreOriginal(archivo.getNombreOriginal())
                .nombreAlmacenado(archivo.getNombreAlmacenado())
                .rutaArchivo(archivo.getRutaArchivo())
                .tipoMime(archivo.getTipoMime())
                .tamaño(archivo.getTamaño())
                .esImagen(archivo.isEsImagen())
                .fechaCreacion(archivo.getFechaCreacion())
                .build();
    }

    private void validarArchivo(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("El archivo excede el tamaño máximo de 10 MB");
        }

        String tipoMime = file.getContentType();
        if (tipoMime == null || !TIPOS_MIME_PERMITIDOS.contains(tipoMime)) {
            throw new RuntimeException("Tipo de archivo no permitido");
        }
    }

    private String generarNombreArchivoUnico(String nombreOriginal) {
        String timestamp = System.currentTimeMillis() + "_";
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
        return timestamp + UUID.randomUUID().toString() + extension;
    }

    private String obtenerNombreUsuario(Integer idUsuario) {
        try {
            UsuarioDTO usuario = authServiceClient.obtenerUsuarioPorId(idUsuario).getBody();
            if (usuario != null) {
                return usuario.getPersona().getNombres() + " " + usuario.getPersona().getApellidos();
            }
        } catch (Exception e) {
            log.error("Error obteniendo usuario: {}", idUsuario, e);
        }
        return "Usuario Desconocido";
    }

    private String obtenerCorreoUsuario(Integer idUsuario) {
        try {
            UsuarioDTO usuario = authServiceClient.obtenerUsuarioPorId(idUsuario).getBody();
            if (usuario != null) {
                return usuario.getCorreo();
            }
        } catch (Exception e) {
            log.error("Error obteniendo correo de usuario: {}", idUsuario, e);
        }
        return "";
    }
}