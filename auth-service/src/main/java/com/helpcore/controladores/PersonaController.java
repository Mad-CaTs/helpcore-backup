package com.helpcore.controladores;

import com.helpcore.entidades.Persona;
import com.helpcore.entidades.dto.PersonaDTO;
import com.helpcore.servicios.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/persona")
public class PersonaController {

    @Autowired
    private PersonaService personaService;

    @PostMapping("/crear")
    public ResponseEntity<PersonaDTO> crearPersona(@RequestBody PersonaDTO personaDTO) {
        try {
            PersonaDTO personaCreada = personaService.crearOActualizarInvitado(personaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(personaCreada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonaDTO> obtenerPersonaPorId(@PathVariable Integer id) {
        try {
            PersonaDTO persona = personaService.obtenerPorId(id);
            if (persona != null) {
                return ResponseEntity.ok(persona);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<PersonaDTO> obtenerPersonaPorDni(@PathVariable String dni) {
        try {
            PersonaDTO persona = personaService.obtenerPorDni(dni);
            if (persona != null) {
                return ResponseEntity.ok(persona);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/codigo-alumno/{codigoAlumno}")
    public ResponseEntity<PersonaDTO> obtenerPersonaPorCodigoAlumno(@PathVariable String codigoAlumno) {
        try {
            PersonaDTO persona = personaService.obtenerPorCodigoAlumno(codigoAlumno);
            if (persona != null) {
                return ResponseEntity.ok(persona);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}