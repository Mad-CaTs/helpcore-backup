package com.helpcore.ticket_service.client;

import com.helpcore.ticket_service.entidades.dto.CategoriaTicketDTO;
import com.helpcore.ticket_service.entidades.dto.PersonaDTO;
import com.helpcore.ticket_service.entidades.dto.UsuarioDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "auth-service", url = "${auth.service.url:http://localhost:8081}", configuration = FeignConfig.class)
public interface AuthServiceClient {

    @PostMapping("persona/crear")
    ResponseEntity<PersonaDTO> crearPersona(@RequestBody PersonaDTO personaDTO);

    @GetMapping("persona/{id}")
    ResponseEntity<PersonaDTO> obtenerPersonaPorId(@PathVariable("id") Integer id);

    @GetMapping("persona/dni/{dni}")
    ResponseEntity<PersonaDTO> obtenerPersonaPorDni(@PathVariable("dni") String dni);

    @GetMapping("persona/codigo-alumno/{codigoAlumno}")
    ResponseEntity<PersonaDTO> obtenerPersonaPorCodigoAlumno(@PathVariable("codigoAlumno") String codigoAlumno);

    @GetMapping("usuario/{id}")
    ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable("id") Integer id);

    @GetMapping("rol-categoria/{idRol}/categorias")
    ResponseEntity<List<CategoriaTicketDTO>> obtenerCategoriasPorRol(@PathVariable("idRol") Integer idRol);

}