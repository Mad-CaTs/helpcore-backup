package com.helpcore.servicios;

import com.helpcore.client.TicketServiceClient;
import com.helpcore.entidades.Persona;
import com.helpcore.entidades.dto.PersonaDTO;
import com.helpcore.entidades.dto.SedeDTO;
import com.helpcore.repositorios.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PersonaService {

    @Autowired
    private PersonaRepository personaRepository;
    private TicketServiceClient ticketServiceClient;


    @Transactional
    public PersonaDTO crearOActualizarInvitado(PersonaDTO dto) {
        Persona persona = personaRepository.findByDni(dto.getDni())
                .orElse(new Persona());

        if (persona.getId() == null) {
            persona.setFechaCreacion(LocalDateTime.now());
        }

        persona.setNombres(dto.getNombres());
        persona.setApellidos(dto.getApellidos());
        persona.setDni(dto.getDni());
        persona.setTelefono(dto.getTelefono());
        persona.setCodigoAlumno(dto.getCodigoAlumno());
        persona.setIdSede(dto.getIdSede());
        persona.setActivo(true);

        Persona personaGuardada = personaRepository.save(persona);
        return convertirADTO(personaGuardada);
    }

    public PersonaDTO obtenerPorId(Integer id) {

        return personaRepository.findById(id)
                .map(this::convertirADTO)
                .orElse(null);
    }

    public PersonaDTO obtenerPorDni(String dni) {
        return personaRepository.findByDni(dni)
                .map(this::convertirADTO)
                .orElse(null);
    }

    public PersonaDTO obtenerPorCodigoAlumno(String codigoAlumno) {
        return personaRepository.findByCodigoAlumno(codigoAlumno)
                .map(this::convertirADTO)
                .orElse(null);
    }

    private PersonaDTO convertirADTO(Persona persona) {
        PersonaDTO.PersonaDTOBuilder builder = PersonaDTO.builder()
                .id(persona.getId())
                .nombres(persona.getNombres())
                .apellidos(persona.getApellidos())
                .dni(persona.getDni())
                .telefono(persona.getTelefono())
                .codigoAlumno(persona.getCodigoAlumno())
                .idSede(persona.getIdSede())
                .activo(persona.isActivo())
                .fechaCreacion(persona.getFechaCreacion());

        // Obtener la sede desde ticket-service si existe idSede
        if (persona.getIdSede() != null) {
            try {
                ResponseEntity<SedeDTO> response = ticketServiceClient.obtenerSedePorId(persona.getIdSede());
                if (response.getBody() != null) {
                    SedeDTO sedeFromTicket = response.getBody();
                    SedeDTO sedeDTO = SedeDTO.builder()
                            .id(sedeFromTicket.getId())
                            .nombre(sedeFromTicket.getNombre())
                            .build();
                    builder.sede(sedeDTO);
                }
            } catch (Exception e) {
                System.err.println("Error al obtener sede: " + e.getMessage());
            }
        }

        return builder.build();
    }
}