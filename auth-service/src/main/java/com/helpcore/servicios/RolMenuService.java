package com.helpcore.servicios;

import com.helpcore.entidades.Menu;
import com.helpcore.entidades.Rol;
import com.helpcore.repositorios.MenuRepository;
import com.helpcore.repositorios.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RolMenuService {

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Transactional
    public Rol asignarMenus(Integer rolId, List<Integer> menuIds) {
        Rol rol = rolRepository.findByIdAndActivoTrue(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        List<Menu> menus = new ArrayList<>();
        for (Integer menuId : menuIds) {
            Menu menu = menuRepository.findByIdAndActivoTrue(menuId)
                    .orElseThrow(() -> new RuntimeException("Menú con ID " + menuId + " no encontrado"));
            menus.add(menu);
        }

        rol.setMenus(menus);
        return rolRepository.save(rol);
    }

    @Transactional
    public Rol agregarMenu(Integer rolId, Integer menuId) {
        Rol rol = rolRepository.findByIdWithMenus(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Menu menu = menuRepository.findByIdAndActivoTrue(menuId)
                .orElseThrow(() -> new RuntimeException("Menú no encontrado"));

        if (rol.getMenus() == null) {
            rol.setMenus(new ArrayList<>());
        }

        boolean yaExiste = rol.getMenus().stream()
                .anyMatch(m -> m.getId().equals(menuId));

        if (yaExiste) {
            throw new RuntimeException("El menú ya está asignado a este rol");
        }

        rol.getMenus().add(menu);
        return rolRepository.save(rol);
    }

    @Transactional
    public Rol quitarMenu(Integer rolId, Integer menuId) {
        Rol rol = rolRepository.findByIdWithMenus(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if (rol.getMenus() == null) {
            throw new RuntimeException("El rol no tiene menús asignados");
        }

        boolean eliminado = rol.getMenus().removeIf(m -> m.getId().equals(menuId));

        if (!eliminado) {
            throw new RuntimeException("El menú no está asignado a este rol");
        }

        return rolRepository.save(rol);
    }

    public List<Menu> obtenerMenusPorRol(Integer rolId) {
        Rol rol = rolRepository.findByIdWithMenus(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        return rol.getMenus() != null ? rol.getMenus() : new ArrayList<>();
    }

    public List<Menu> obtenerMenusDisponibles(Integer rolId) {
        Rol rol = rolRepository.findByIdWithMenus(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        List<Menu> todosMenus = menuRepository.findByActivoTrue();
        List<Integer> menusAsignados = rol.getMenus() != null
                ? rol.getMenus().stream().map(Menu::getId).collect(Collectors.toList())
                : new ArrayList<>();

        return todosMenus.stream()
                .filter(m -> !menusAsignados.contains(m.getId()))
                .collect(Collectors.toList());
    }
}