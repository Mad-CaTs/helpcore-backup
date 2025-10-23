package com.helpcore.ticket_service.servicios;

import com.helpcore.ticket_service.entidades.CategoriaTicket;
import com.helpcore.ticket_service.entidades.dto.CategoriaTicketDTO;
import com.helpcore.ticket_service.repositorios.CategoriaTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaTicketService {

    @Autowired
    private CategoriaTicketRepository categoriaTicketRepository;

    public CategoriaTicket buscar(Integer id) {
        return categoriaTicketRepository.findById(id).orElse(null);
    }

    public List<CategoriaTicket> listar() {
        return categoriaTicketRepository.findAll();
    }

    public List<CategoriaTicketDTO> listarJerarquico() {
        List<CategoriaTicket> todasActivas = categoriaTicketRepository.findByActivoTrue();

        List<CategoriaTicket> categoriasPadre = todasActivas.stream()
                .filter(c -> c.getCategoriaPadre() == null)
                .collect(Collectors.toList());

        return categoriasPadre.stream()
                .map(this::convertirADTOConHijos)
                .collect(Collectors.toList());
    }

    public List<CategoriaTicketDTO> listarTodasJerarquico() {
        List<CategoriaTicket> todas = categoriaTicketRepository.findAll();

        List<CategoriaTicket> categoriasPadre = todas.stream()
                .filter(c -> c.getCategoriaPadre() == null)
                .collect(Collectors.toList());

        return categoriasPadre.stream()
                .map(this::convertirADTOConTodosLosHijos)
                .collect(Collectors.toList());
    }

    public List<CategoriaTicketDTO> listarCategoriasPadre() {
        List<CategoriaTicket> categoriasPadre = categoriaTicketRepository
                .findByActivoTrueAndCategoriaPadreIsNull();

        return categoriasPadre.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public CategoriaTicketDTO obtenerPorId(Integer id) {
        CategoriaTicket categoria = buscar(id);
        return categoria != null ? convertirADTO(categoria) : null;
    }

    @Transactional
    public CategoriaTicket crear(CategoriaTicketDTO dto) {
        validarCategoria(dto);

        CategoriaTicket nuevaCategoria = CategoriaTicket.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .activo(true)
                .build();

        if (dto.getIdCategoriaPadre() != null) {
            CategoriaTicket padre = buscar(dto.getIdCategoriaPadre());
            if (padre == null) {
                throw new IllegalArgumentException("La categoría padre no existe");
            }
            if (!padre.isActivo()) {
                throw new IllegalArgumentException("La categoría padre está inactiva");
            }
            if (padre.getCategoriaPadre() != null) {
                throw new IllegalArgumentException("Solo se permiten dos niveles de jerarquía");
            }
            nuevaCategoria.setCategoriaPadre(padre);
        }

        return categoriaTicketRepository.save(nuevaCategoria);
    }

    @Transactional
    public CategoriaTicket actualizar(CategoriaTicketDTO dto) {
        validarCategoria(dto);

        CategoriaTicket categoriaExistente = buscar(dto.getId());
        if (categoriaExistente == null) {
            throw new IllegalArgumentException("La categoría no existe");
        }

        categoriaExistente.setNombre(dto.getNombre());
        categoriaExistente.setDescripcion(dto.getDescripcion());

        if (dto.getIdCategoriaPadre() != null) {
            if (dto.getIdCategoriaPadre().equals(dto.getId())) {
                throw new IllegalArgumentException("Una categoría no puede ser padre de sí misma");
            }

            CategoriaTicket padre = buscar(dto.getIdCategoriaPadre());
            if (padre == null) {
                throw new IllegalArgumentException("La categoría padre no existe");
            }
            if (!padre.isActivo()) {
                throw new IllegalArgumentException("La categoría padre está inactiva");
            }
            if (padre.getCategoriaPadre() != null) {
                throw new IllegalArgumentException("Solo se permiten dos niveles de jerarquía");
            }

            categoriaExistente.setCategoriaPadre(padre);
        } else {
            categoriaExistente.setCategoriaPadre(null);
        }

        return categoriaTicketRepository.save(categoriaExistente);
    }

    @Transactional
    public void eliminar(Integer id) {
        CategoriaTicket categoria = buscar(id);
        if (categoria == null) {
            throw new IllegalArgumentException("La categoría no existe");
        }

        categoria.setActivo(false);
        categoriaTicketRepository.save(categoria);

        if (categoria.getCategoriaPadre() == null) {
            List<CategoriaTicket> hijos = categoriaTicketRepository
                    .findByCategoriaPadreId(id);

            hijos.forEach(hijo -> {
                hijo.setActivo(false);
                categoriaTicketRepository.save(hijo);
            });
        }
    }

    /**
     * Buscar múltiples categorías por sus IDs
     */
    public List<CategoriaTicketDTO> buscarPorIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }

        List<CategoriaTicket> categorias = categoriaTicketRepository.findAllById(ids);
        return categorias.stream()
                .map(this::convertirADTOCompleto)
                .collect(Collectors.toList());
    }

    // ===== MÉTODOS DE CONVERSIÓN =====

    /**
     * Convierte a DTO con hijos activos
     */
    private CategoriaTicketDTO convertirADTOConHijos(CategoriaTicket categoria) {
        List<CategoriaTicketDTO> subcategorias = new ArrayList<>();

        if (categoria.getSubcategorias() != null) {
            subcategorias = categoria.getSubcategorias().stream()
                    .filter(CategoriaTicket::isActivo)
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());
        }

        return CategoriaTicketDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .idCategoriaPadre(categoria.getCategoriaPadre() != null ?
                        categoria.getCategoriaPadre().getId() : null)
                .esPadre(categoria.esPadre())
                .activo(categoria.isActivo())
                .subcategorias(subcategorias)
                .build();
    }

    /**
     * Convierte a DTO con todos los hijos (activos e inactivos)
     */
    private CategoriaTicketDTO convertirADTOConTodosLosHijos(CategoriaTicket categoria) {
        List<CategoriaTicketDTO> subcategorias = new ArrayList<>();

        if (categoria.getSubcategorias() != null) {
            subcategorias = categoria.getSubcategorias().stream()
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());
        }

        return CategoriaTicketDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .idCategoriaPadre(categoria.getCategoriaPadre() != null ?
                        categoria.getCategoriaPadre().getId() : null)
                .esPadre(categoria.esPadre())
                .activo(categoria.isActivo())
                .subcategorias(subcategorias)
                .build();
    }

    /**
     * Convierte a DTO simple sin hijos ni padre completo
     */
    private CategoriaTicketDTO convertirADTO(CategoriaTicket categoria) {
        return CategoriaTicketDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .idCategoriaPadre(categoria.getCategoriaPadre() != null ?
                        categoria.getCategoriaPadre().getId() : null)
                .esPadre(categoria.esPadre())
                .activo(categoria.isActivo())
                .build();
    }

    /**
     * Convierte a DTO completo con información del padre
     */
    private CategoriaTicketDTO convertirADTOCompleto(CategoriaTicket categoria) {
        CategoriaTicketDTO dto = CategoriaTicketDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .idCategoriaPadre(categoria.getCategoriaPadre() != null ?
                        categoria.getCategoriaPadre().getId() : null)
                .esPadre(categoria.esPadre())
                .activo(categoria.isActivo())
                .build();

        if (categoria.getCategoriaPadre() != null) {
            // DTO simple para el padre
            CategoriaTicketDTO padreDTO = CategoriaTicketDTO.builder()
                    .id(categoria.getCategoriaPadre().getId())
                    .nombre(categoria.getCategoriaPadre().getNombre())
                    .build();
            dto.setCategoriaPadre(padreDTO);
        }

        return dto;
    }

    private void validarCategoria(CategoriaTicketDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es requerido");
        }

        if (dto.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede exceder 100 caracteres");
        }

        if (dto.getDescripcion() != null && dto.getDescripcion().length() > 255) {
            throw new IllegalArgumentException("La descripción no puede exceder 255 caracteres");
        }
    }

    @Transactional(readOnly = true)
    public CategoriaTicketDTO obtenerPorIdCompleto(Integer id) {
        CategoriaTicket categoria = buscar(id);
        if (categoria == null) {
            return null;
        }
        return convertirADTOCompleto(categoria);
    }
}