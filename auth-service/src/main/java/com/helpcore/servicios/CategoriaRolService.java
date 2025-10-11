package com.helpcore.servicios;

import com.helpcore.client.TicketServiceClient;
import com.helpcore.entidades.Rol;
import com.helpcore.entidades.dto.CategoriaTicketDTO;
import com.helpcore.repositorios.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CategoriaRolService {

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private TicketServiceClient ticketServiceClient;

    @Transactional
    public Rol asignarCategoriasARol(Integer idRol, List<Integer> categoriasIds) {
        Optional<Rol> rolOpt = rolRepository.findById(idRol);
        if (rolOpt.isEmpty()) {
            throw new RuntimeException("Rol no encontrado con ID: " + idRol);
        }

        if (categoriasIds != null && !categoriasIds.isEmpty()) {
            validarCategorias(categoriasIds);
        }

        Rol rol = rolOpt.get();
        rol.setCategoriasIds(categoriasIds);
        return rolRepository.save(rol);
    }

    @Transactional
    public Rol agregarCategoriasARol(Integer idRol, List<Integer> nuevasCategoriasIds) {
        Optional<Rol> rolOpt = rolRepository.findById(idRol);
        if (rolOpt.isEmpty()) {
            throw new RuntimeException("Rol no encontrado con ID: " + idRol);
        }

        validarCategorias(nuevasCategoriasIds);

        Rol rol = rolOpt.get();
        List<Integer> categoriasActuales = rol.getCategoriasIds();

        if (categoriasActuales == null) {
            categoriasActuales = new ArrayList<>();
        } else {
            categoriasActuales = new ArrayList<>(categoriasActuales);
        }

        for (Integer idCategoria : nuevasCategoriasIds) {
            if (!categoriasActuales.contains(idCategoria)) {
                categoriasActuales.add(idCategoria);
            }
        }

        rol.setCategoriasIds(categoriasActuales);
        return rolRepository.save(rol);
    }

    @Transactional
    public Rol removerCategoriasDeRol(Integer idRol, List<Integer> categoriasIdsARemover) {
        Optional<Rol> rolOpt = rolRepository.findById(idRol);
        if (rolOpt.isEmpty()) {
            throw new RuntimeException("Rol no encontrado con ID: " + idRol);
        }

        Rol rol = rolOpt.get();
        List<Integer> categoriasActuales = rol.getCategoriasIds();

        if (categoriasActuales != null && !categoriasActuales.isEmpty()) {
            categoriasActuales = new ArrayList<>(categoriasActuales);
            categoriasActuales.removeAll(categoriasIdsARemover);
            rol.setCategoriasIds(categoriasActuales);
            return rolRepository.save(rol);
        }

        return rol;
    }

    public List<CategoriaTicketDTO> obtenerCategoriasPorRol(Integer idRol) {
        Optional<Rol> rolOpt = rolRepository.findById(idRol);
        if (rolOpt.isEmpty()) {
            throw new RuntimeException("Rol no encontrado con ID: " + idRol);
        }

        Rol rol = rolOpt.get();
        if (rol.getCategoriasIds() == null || rol.getCategoriasIds().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            return ticketServiceClient.buscarCategoriasPorIds(rol.getCategoriasIds());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener categorías: " + e.getMessage());
        }
    }

    public List<CategoriaTicketDTO> obtenerCategoriasPadrePorRol(Integer idRol) {
        List<CategoriaTicketDTO> todasLasCategorias = obtenerCategoriasPorRol(idRol);
        return todasLasCategorias.stream()
                .filter(cat -> cat.getIdCategoriaPadre() == null)
                .toList();
    }

    public List<CategoriaTicketDTO> obtenerCategoriasHijasPorRol(Integer idRol) {
        List<CategoriaTicketDTO> todasLasCategorias = obtenerCategoriasPorRol(idRol);
        return todasLasCategorias.stream()
                .filter(cat -> cat.getIdCategoriaPadre() != null)
                .toList();
    }


    public boolean rolTieneAccesoACategoria(Integer idRol, Integer idCategoria) {
        Optional<Rol> rolOpt = rolRepository.findById(idRol);
        if (rolOpt.isEmpty()) {
            return false;
        }

        Rol rol = rolOpt.get();
        return rol.getCategoriasIds() != null &&
                rol.getCategoriasIds().contains(idCategoria);
    }

    private void validarCategorias(List<Integer> categoriasIds) {
        try {
            List<CategoriaTicketDTO> categorias = ticketServiceClient.buscarCategoriasPorIds(categoriasIds);
            if (categorias.size() != categoriasIds.size()) {
                throw new RuntimeException("Una o más categorías no existen o están inactivas");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al validar categorías: " + e.getMessage());
        }
    }


    public List<Rol> obtenerRolesPorCategoria(Integer idCategoria) {
        List<Rol> todosLosRoles = rolRepository.findAll();
        return todosLosRoles.stream()
                .filter(rol -> rol.getCategoriasIds() != null &&
                        rol.getCategoriasIds().contains(idCategoria))
                .toList();
    }
}