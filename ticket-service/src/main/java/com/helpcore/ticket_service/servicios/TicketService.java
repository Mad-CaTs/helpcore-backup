package com.helpcore.ticket_service.servicios;

import com.helpcore.ticket_service.client.AuthServiceClient;
import com.helpcore.ticket_service.entidades.CategoriaTicket;
import com.helpcore.ticket_service.entidades.Sede;
import com.helpcore.ticket_service.entidades.Ticket;
import com.helpcore.ticket_service.entidades.dto.*;
import com.helpcore.ticket_service.repositorios.CategoriaTicketRepository;
import com.helpcore.ticket_service.repositorios.SedeRepository;
import com.helpcore.ticket_service.repositorios.TicketRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private InvitadoService invitadoService;

    @Autowired
    private CategoriaTicketRepository categoriaTicketRepository;

    @Autowired
    private AuthServiceClient personaClient;

    @Autowired
    private AuthServiceClient usuarioClient;

    private final SecureRandom random = new SecureRandom();

    private static final Integer ROL_ADMINISTRADOR = 1;
    private static final Integer ROL_USUARIO = 2;

    private String generarCodigoTicketUnico() {
        String codigo;
        int intentos = 0;
        int maxIntentos = 100;

        do {
            long numero = 1_000_000_000L + (Math.abs(random.nextLong()) % 9_000_000_000L);
            codigo = String.valueOf(numero);
            intentos++;

            if (intentos >= maxIntentos) {
                throw new RuntimeException("No se pudo generar un código único después de " + maxIntentos + " intentos");
            }
        } while (ticketRepository.existsByCodigoTicket(codigo));

        return codigo;
    }

    public Ticket buscar(Integer id) {
        return ticketRepository.findById(id).orElse(null);
    }

    public List<TicketDashboardAgenteDTO> obtenerTicketsPorRolDeUsuario(Integer idUsuario) {
        try {
            ResponseEntity<UsuarioDTO> response = personaClient.obtenerUsuarioPorId(idUsuario);
            UsuarioDTO usuario = response.getBody();

            if (usuario == null || usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
                throw new RuntimeException("Usuario no encontrado o sin roles asignados");
            }

            Integer idRolPrincipal = obtenerRolPrincipal(usuario.getRoles());

            List<Ticket> tickets;

            if (idRolPrincipal.equals(ROL_ADMINISTRADOR)) {
                tickets = ticketRepository.findAll();

            } else if (idRolPrincipal.equals(ROL_USUARIO)) {
                tickets = ticketRepository.findByIdUsuarioCliente(idUsuario);

            } else {
                List<Integer> categoriasIds = obtenerCategoriasIdsPorRol(idRolPrincipal);

                if (categoriasIds == null || categoriasIds.isEmpty()) {
                    throw new RuntimeException("El rol no tiene categorías asignadas");
                }

                tickets = ticketRepository.findByCategoriaIdIn(categoriasIds);

                tickets = tickets.stream()
                        .filter(t -> t.getEstado().equals(Ticket.Estado.NUEVO) ||
                                (t.getIdUsuarioAgente() != null && t.getIdUsuarioAgente().equals(idUsuario)))
                        .collect(Collectors.toList());
            }

            return tickets.stream()
                    .map(this::convertirATicketDashboardDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("Error al obtener tickets por rol: " + e.getMessage(), e);
        }
    }

    private List<Integer> obtenerCategoriasIdsPorRol(Integer idRol) {
        try {
            ResponseEntity<List<CategoriaTicketDTO>> response =
                    usuarioClient.obtenerCategoriasPorRol(idRol);

            if (response.getBody() != null) {
                return response.getBody().stream()
                        .map(CategoriaTicketDTO::getId)
                        .collect(Collectors.toList());
            }

            return new ArrayList<>();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener categorías del rol: " + e.getMessage(), e);
        }
    }

    private Integer obtenerRolPrincipal(List<RolDTO> roles) {
        for (RolDTO rol : roles) {
            if (rol.getId().equals(ROL_ADMINISTRADOR)) {
                return ROL_ADMINISTRADOR;
            }
        }

        for (RolDTO rol : roles) {
            if (rol.getId().equals(ROL_USUARIO)) {
                return ROL_USUARIO;
            }
        }

        return roles.get(0).getId();
    }

    private TicketDashboardAgenteDTO convertirATicketDashboardDTO(Ticket ticket) {
        TicketDashboardAgenteDTO dto = new TicketDashboardAgenteDTO();
        dto.setId(ticket.getId());
        dto.setCodigoTicket(ticket.getCodigoTicket());
        dto.setTitulo(ticket.getTitulo());
        dto.setEstado(ticket.getEstado());
        dto.setPrioridad(ticket.getPrioridad());
        dto.setCodigoAlumno(ticket.getCodigoAlumno());
        dto.setIdUsuarioAgente(ticket.getIdUsuarioAgente());
        dto.setFechaCreacion(ticket.getFechaCreacion());

        if (ticket.getIdPersona() != null) {
            try {
                ResponseEntity<PersonaDTO> response = personaClient.obtenerPersonaPorId(ticket.getIdPersona());
                if (response.getBody() != null) {
                    PersonaDTO persona = response.getBody();

                    TicketDashboardAgenteDTO.InvitadoSimpleDTO personaDTO = new TicketDashboardAgenteDTO.InvitadoSimpleDTO();
                    personaDTO.setNombre(persona.getNombres());
                    personaDTO.setApellido(persona.getApellidos());
                    dto.setInvitado(personaDTO);

                    if (persona.getSede() != null) {
                        dto.setSede(persona.getSede().getNombre());
                    } else if (persona.getIdSede() != null) {
                        Sede sede = sedeRepository.findById(persona.getIdSede()).orElse(null);
                        if (sede != null) {
                            dto.setSede(sede.getNombre());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error al obtener persona: " + e.getMessage());
            }
        }

        if (ticket.getCategoria() != null) {
            TicketDashboardAgenteDTO.CategoriaSimpleDTO categoriaDTO = new TicketDashboardAgenteDTO.CategoriaSimpleDTO();
            categoriaDTO.setNombre(ticket.getCategoria().getNombre());
            dto.setCategoria(categoriaDTO);
        }

        return dto;
    }

    public Ticket crear(Ticket ticket) {
        ticket.setActivo(true);
        return ticketRepository.save(ticket);
    }

    public Ticket actualizar(Ticket ticket) {
        Ticket ticketActual = buscar(ticket.getId());

        if (ticketActual != null && ticketActual.isActivo()) {
            ticketActual.setTitulo(ticket.getTitulo());
            ticketActual.setDescripcion(ticket.getDescripcion());
            ticketActual.setEstado(ticket.getEstado());
            ticketActual.setPrioridad(ticket.getPrioridad());
            ticketActual.setCodigoAlumno(ticket.getCodigoAlumno());
            ticketActual.setIdUsuarioCliente(ticket.getIdUsuarioCliente());
            ticketActual.setIdUsuarioAgente(ticket.getIdUsuarioAgente());
            ticketActual.setCategoria(ticket.getCategoria());
            ticketActual.setIdPersona(ticket.getIdPersona());
            ticketActual.setFechaAsignacion(ticket.getFechaAsignacion());
            ticketActual.setFechaResolucion(ticket.getFechaResolucion());
            ticketActual.setFechaCierre(ticket.getFechaCierre());

            return ticketRepository.save(ticketActual);
        }
        return null;
    }

    public boolean eliminar(Integer id) {
        Ticket ticketActual = buscar(id);
        if (ticketActual != null && ticketActual.isActivo()) {
            ticketActual.setActivo(false);
            ticketRepository.save(ticketActual);
            return true;
        }
        return false;
    }

    @Transactional
    public Ticket crearTicketConUsuario(TicketUsuarioRequestDTO dto) {
        try {
            ResponseEntity<UsuarioDTO> responseUsuario = usuarioClient.obtenerUsuarioPorId(dto.getIdUsuario());
            UsuarioDTO usuario = responseUsuario.getBody();

            if (usuario == null || usuario.getPersona() == null) {
                throw new RuntimeException("Usuario no encontrado o sin información de persona");
            }

            PersonaDTO persona = usuario.getPersona();

            if (persona.getId() == null) {
                throw new RuntimeException("Persona asociada al usuario no tiene ID válido");
            }

            CategoriaTicket categoria = categoriaTicketRepository.findById(dto.getIdCategoria())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            String codigoTicket = generarCodigoTicketUnico();

            Ticket ticket = new Ticket();
            ticket.setCodigoTicket(codigoTicket);
            ticket.setTitulo(dto.getTitulo());
            ticket.setDescripcion(dto.getDescripcion());
            ticket.setEstado(Ticket.Estado.NUEVO);
            ticket.setPrioridad(Ticket.Prioridad.MEDIA);
            ticket.setCodigoAlumno(persona.getCodigoAlumno());
            ticket.setIdUsuarioCliente(dto.getIdUsuario());
            ticket.setIdUsuarioAgente(null);
            ticket.setCategoria(categoria);
            ticket.setIdPersona(persona.getId());
            ticket.setActivo(true);
            ticket.setFechaCreacion(LocalDateTime.now());
            ticket.setFechaAsignacion(null);
            ticket.setFechaResolucion(null);
            ticket.setFechaCierre(null);

            return ticketRepository.save(ticket);

        } catch (Exception e) {
            throw new RuntimeException("Error al crear el ticket con usuario: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Ticket crearTicketConInvitado(TicketInvitadoRequestDTO dto, PersonaDTO personaDTO, Integer idCategoria) {
        try {
            ResponseEntity<PersonaDTO> response = personaClient.crearPersona(personaDTO);
            PersonaDTO personaGuardada = response.getBody();

            if (personaGuardada == null || personaGuardada.getId() == null) {
                throw new RuntimeException("Error al crear/obtener persona desde auth-service");
            }

            CategoriaTicket categoria = categoriaTicketRepository.findById(idCategoria)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            String codigoTicket = generarCodigoTicketUnico();

            Ticket ticket = new Ticket();
            ticket.setCodigoTicket(codigoTicket);
            ticket.setTitulo(dto.getTitulo());
            ticket.setDescripcion(dto.getDescripcion());
            ticket.setEstado(Ticket.Estado.NUEVO);
            ticket.setPrioridad(Ticket.Prioridad.MEDIA);
            ticket.setCodigoAlumno(dto.getCodigoAlumno());
            ticket.setIdUsuarioCliente(null);
            ticket.setIdUsuarioAgente(null);
            ticket.setCategoria(categoria);
            ticket.setIdPersona(personaGuardada.getId());
            ticket.setActivo(true);
            ticket.setFechaCreacion(LocalDateTime.now());
            ticket.setFechaAsignacion(null);
            ticket.setFechaResolucion(null);
            ticket.setFechaCierre(null);
            ticket.setCorreoInvitado(dto.getCorreoInvitado());

            return ticketRepository.save(ticket);

        } catch (Exception e) {
            throw new RuntimeException("Error al crear el ticket con persona: " + e.getMessage(), e);
        }
    }
    @Autowired
    private SedeRepository sedeRepository;


    public VerTicketDTO obtenerTicketCompleto(String codigoTicket, Integer idUsuario) {
        try {
            Ticket ticket = ticketRepository.findByCodigoTicket(codigoTicket)
                    .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

            try {
                ResponseEntity<UsuarioDTO> usuarioResponse = personaClient.obtenerUsuarioPorId(idUsuario);
                UsuarioDTO usuario = usuarioResponse.getBody();

                if (usuario == null || usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
                    return null;
                }

                boolean esAdministrador = usuario.getRoles().stream()
                        .anyMatch(rol -> rol.getId() != null && rol.getId().equals(1));

                boolean esAgente = usuario.getRoles().stream()
                        .anyMatch(rol -> rol.getId() != null && rol.getId() >= 3);
                boolean tienePermiso = false;

                if (esAdministrador) {
                    tienePermiso = true;
                } else if (esAgente) {
                    if (ticket.getIdUsuarioAgente() == null) {
                        tienePermiso = true;
                    } else if (ticket.getIdUsuarioAgente().equals(idUsuario)) {
                        tienePermiso = true;
                    }
                } else {
                    if (ticket.getIdUsuarioCliente() != null && ticket.getIdUsuarioCliente().equals(idUsuario)) {
                        tienePermiso = true;
                    }
                }

                if (!tienePermiso) {
                    return null;
                }

            } catch (Exception e) {
                System.err.println("Error al validar permisos del usuario: " + e.getMessage());
                return null;
            }

            VerTicketDTO dto = new VerTicketDTO();
            dto.setId(ticket.getId());
            dto.setCodigoTicket(ticket.getCodigoTicket());
            dto.setTitulo(ticket.getTitulo());
            dto.setDescripcion(ticket.getDescripcion());
            dto.setEstado(ticket.getEstado());
            dto.setPrioridad(ticket.getPrioridad());
            dto.setCodigoAlumno(ticket.getCodigoAlumno());
            dto.setFechaCreacion(ticket.getFechaCreacion());
            dto.setFechaAsignacion(ticket.getFechaAsignacion());
            dto.setFechaResolucion(ticket.getFechaResolucion());
            dto.setFechaCierre(ticket.getFechaCierre());

            if (ticket.getIdPersona() != null) {
                try {
                    ResponseEntity<PersonaDTO> response = personaClient.obtenerPersonaPorId(ticket.getIdPersona());
                    if (response.getBody() != null) {
                        PersonaDTO persona = response.getBody();

                        VerTicketDTO.SolicitanteDTO solicitante = new VerTicketDTO.SolicitanteDTO();
                        solicitante.setId(persona.getId());
                        solicitante.setNombre(persona.getNombres());
                        solicitante.setApellido(persona.getApellidos());
                        solicitante.setTelefono(persona.getTelefono());
                        solicitante.setDni(persona.getDni());
                        solicitante.setCodigoAlumno(persona.getCodigoAlumno());

                        if (ticket.getIdUsuarioCliente() != null) {
                            try {
                                ResponseEntity<UsuarioDTO> usuarioClienteResponse = personaClient.obtenerUsuarioPorId(ticket.getIdUsuarioCliente());
                                if (usuarioClienteResponse.getBody() != null) {
                                    solicitante.setCorreo(usuarioClienteResponse.getBody().getCorreo());
                                }
                            } catch (Exception e) {
                                System.err.println("Error al obtener correo del usuario: " + e.getMessage());
                            }
                        }

                        if (persona.getIdSede() != null) {
                            Sede sede = sedeRepository.findById(persona.getIdSede()).orElse(null);
                            if (sede != null) {
                                VerTicketDTO.SedeDTO sedeDTO = new VerTicketDTO.SedeDTO();
                                sedeDTO.setId(sede.getId());
                                sedeDTO.setNombre(sede.getNombre());
                                solicitante.setSede(sedeDTO);
                            }
                        }

                        dto.setSolicitante(solicitante);
                    }
                } catch (Exception e) {
                    System.err.println("Error al obtener persona: " + e.getMessage());
                }
            }

            if (ticket.getIdUsuarioAgente() != null) {
                try {
                    ResponseEntity<UsuarioDTO> response = personaClient.obtenerUsuarioPorId(ticket.getIdUsuarioAgente());
                    if (response.getBody() != null) {
                        UsuarioDTO usuario = response.getBody();
                        VerTicketDTO.AgenteDTO agente = new VerTicketDTO.AgenteDTO();
                        agente.setId(usuario.getId());
                        agente.setCorreo(usuario.getCorreo());

                        if (usuario.getPersona() != null) {
                            String nombreCompleto = usuario.getPersona().getNombres() + " " +
                                    usuario.getPersona().getApellidos();
                            agente.setNombreCompleto(nombreCompleto);
                        }
                        dto.setAgente(agente);
                    }
                } catch (Exception e) {
                    System.err.println("Error al obtener agente: " + e.getMessage());
                }
            }

            if (ticket.getCategoria() != null) {
                VerTicketDTO.CategoriaDTO categoria = new VerTicketDTO.CategoriaDTO();
                categoria.setId(ticket.getCategoria().getId());
                categoria.setNombre(ticket.getCategoria().getNombre());
                dto.setCategoria(categoria);
            }

            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener ticket completo: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Ticket tomarTicket(Integer idTicket, Integer idUsuarioAgente) {
        try {
            Ticket ticket = ticketRepository.findById(idTicket)
                    .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

            if (!ticket.getEstado().equals(Ticket.Estado.NUEVO)) {
                throw new RuntimeException("Solo se pueden tomar tickets en estado NUEVO");
            }

            if (ticket.getIdUsuarioAgente() != null) {
                throw new RuntimeException("Este ticket ya ha sido asignado a un agente");
            }

            ticket.setIdUsuarioAgente(idUsuarioAgente);
            ticket.setEstado(Ticket.Estado.EN_ATENCION);
            ticket.setFechaAsignacion(LocalDateTime.now());

            return ticketRepository.save(ticket);

        } catch (Exception e) {
            throw new RuntimeException("Error al tomar el ticket: " + e.getMessage(), e);
        }
    }

    public VerTicketDTO obtenerTicketCompletoById(Integer idTicket, Integer idUsuario) {
        try {
            Ticket ticket = ticketRepository.findById(idTicket)
                    .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

            return obtenerTicketCompleto(ticket.getCodigoTicket(), idUsuario);

        } catch (Exception e) {
            throw new RuntimeException("Error al obtener ticket por ID: " + e.getMessage(), e);
        }
    }

    public Ticket obtenerPorCodigo(String codigoTicket) {
        return ticketRepository.findByCodigoTicket(codigoTicket).orElse(null);
    }

}