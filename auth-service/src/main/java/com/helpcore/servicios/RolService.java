package com.helpcore.servicios;

import com.helpcore.entidades.Rol;
import com.helpcore.repositorios.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;

    public Rol buscar(Integer id) {
        return rolRepository.findById(id).orElse(null);
    }

    public List<Rol> listar() {
        return rolRepository.listarActivos();
    }

    public Rol crear(Rol rol) {
        rol.setActivo(true);
        return rolRepository.save(rol);
    }

    public Rol actualizar(Rol rol) {
        Rol rolActual = buscar(rol.getId());
        if (rolActual != null && rolActual.isActivo()) {
            rolActual.setNombre(rol.getNombre());
            rolActual.setDescripcion(rol.getDescripcion());
            return rolRepository.save(rolActual);
        }
        return null;
    }

    public boolean eliminar(Integer id) {
        Rol rolActual = buscar(id);
        if (rolActual != null && rolActual.isActivo()) {
            rolActual.setActivo(false);
            rolRepository.save(rolActual);
            return true;
        }
        return false;
    }
}
