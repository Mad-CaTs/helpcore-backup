package com.helpcore.servicios;

import com.helpcore.entidades.Rol;
import com.helpcore.repositorios.RolRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RolService {


    @Autowired
    private RolRepository rolRepository;

    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    @Transactional
    public Rol crear(Rol rol) {
        if (rol.getNombre() == null || rol.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del rol es obligatorio");
        }

        if (rolRepository.existsByNombreAndActivoTrue(rol.getNombre())) {
            throw new RuntimeException("Ya existe un rol activo con ese nombre");
        }

        return rolRepository.save(rol);
    }

    @Transactional
    public Rol actualizar(Rol rol) {
        if (rol.getId() == null) {
            throw new RuntimeException("El ID del rol es requerido");
        }

        Rol rolExistente = rolRepository.findByIdAndActivoTrue(rol.getId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if (!rolExistente.getNombre().equals(rol.getNombre())
                && rolRepository.existsByNombreAndActivoTrue(rol.getNombre())) {
            throw new RuntimeException("Ya existe otro rol activo con ese nombre");
        }

        rolExistente.setNombre(rol.getNombre());
        rolExistente.setDescripcion(rol.getDescripcion());

        return rolRepository.save(rolExistente);
    }

    @Transactional
    public boolean eliminar(Integer id) {
        return rolRepository.findByIdAndActivoTrue(id)
                .map(rol -> {
                    rol.setActivo(false);
                    rolRepository.save(rol);
                    return true;
                })
                .orElse(false);
    }

    public Rol buscarPorId(Integer id) {
        return rolRepository.findByIdAndActivoTrue(id).orElse(null);
    }

    public Rol buscarConMenus(Integer id) {
        return rolRepository.findByIdWithMenus(id).orElse(null);
    }
}
