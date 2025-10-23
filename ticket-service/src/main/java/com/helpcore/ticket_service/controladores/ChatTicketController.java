package com.helpcore.ticket_service.controladores;

import com.helpcore.ticket_service.entidades.dto.*;
import com.helpcore.ticket_service.servicios.ChatTicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/chat")
@Slf4j
public class ChatTicketController {

    @Autowired
    private ChatTicketService chatTicketService;

    @GetMapping("/ticket/{idTicket}")
    public ResponseEntity<?> obtenerChatTicket(
            @PathVariable Integer idTicket,
            @RequestParam Integer usuarioId) {
        try {
            log.info("Obteniendo chat para ticket: {} del usuario: {}", idTicket, usuarioId);
            ChatTicketDTO chat = chatTicketService.obtenerChatTicket(idTicket, usuarioId);
            return ResponseEntity.ok(chat);
        } catch (RuntimeException e) {
            log.error("Error al obtener chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new RespuestaErrorDTO("Error al obtener chat", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RespuestaErrorDTO("Error interno del servidor", e.getMessage()));
        }
    }

    @PostMapping("/mensaje")
    public ResponseEntity<?> crearMensaje(
            @RequestParam Integer idTicket,
            @RequestParam String mensaje,
            @RequestParam Integer usuarioId) {
        try {
            log.info("Creando mensaje en ticket: {}", idTicket);
            MensajeDTO mensajeCreado = chatTicketService.crearMensaje(idTicket, mensaje, usuarioId);

            RespuestaCrearMensajeDTO respuesta = RespuestaCrearMensajeDTO.builder()
                    .success(true)
                    .mensaje("Mensaje enviado exitosamente")
                    .mensajeCreado(mensajeCreado)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (RuntimeException e) {
            log.error("Error al crear mensaje: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new RespuestaErrorDTO("Error al enviar mensaje", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RespuestaErrorDTO("Error interno del servidor", e.getMessage()));
        }
    }

    @PostMapping("/adjuntar-archivo")
    public ResponseEntity<?> adjuntarArchivo(
            @RequestParam Integer idRespuesta,
            @RequestParam MultipartFile file) {
        try {
            log.info("Adjuntando archivo a respuesta: {}", idRespuesta);
            ArchivoDTO archivoCreado = chatTicketService.adjuntarArchivo(idRespuesta, file);

            RespuestaCargarArchivosDTO respuesta = RespuestaCargarArchivosDTO.builder()
                    .success(true)
                    .mensaje("Archivo adjuntado exitosamente")
                    .archivoCreado(archivoCreado)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (RuntimeException e) {
            log.error("Error al adjuntar archivo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new RespuestaCargarArchivosDTO(false, "Error al adjuntar archivo", null, e.getMessage()));
        } catch (IOException e) {
            log.error("Error de E/S al guardar archivo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RespuestaCargarArchivosDTO(false, "Error al guardar archivo", null, e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RespuestaCargarArchivosDTO(false, "Error interno del servidor", null, e.getMessage()));
        }
    }

    @GetMapping("/descargar-archivo/{idArchivo}")
    public ResponseEntity<?> descargarArchivo(@PathVariable Integer idArchivo) {
        try {
            log.info("Descargando archivo: {}", idArchivo);
            byte[] contenido = chatTicketService.obtenerArchivo(idArchivo);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=archivo")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(contenido);
        } catch (RuntimeException e) {
            log.error("Error al descargar archivo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new RespuestaErrorDTO("Archivo no encontrado", e.getMessage()));
        } catch (IOException e) {
            log.error("Error de E/S al descargar: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RespuestaErrorDTO("Error al descargar archivo", e.getMessage()));
        }
    }
}