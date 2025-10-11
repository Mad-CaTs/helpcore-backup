package com.helpcore.servicios;

import com.helpcore.entidades.Menu;
import com.helpcore.entidades.Usuario;
import com.helpcore.repositorios.MenuRepository;
import com.helpcore.repositorios.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Menu> listar() {
        return menuRepository.findAll();
    }

    public List<Menu> listarMenusPrincipales() {
        return menuRepository.findMenusPrincipales();
    }

    public List<Menu> listarSubmenus(Integer menuPadreId) {
        return menuRepository.findByMenuPadreIdAndActivoTrue(menuPadreId);
    }

    public List<Menu> listarPorCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Correo no encontrado"));

        // Obtener todos los menús asociados a los roles del usuario
        Set<Menu> menusUnicos = new HashSet<>();

        usuario.getRoles().forEach(rol -> {
            if (rol.isActivo()) {
                menusUnicos.addAll(rol.getMenus().stream()
                        .filter(Menu::isActivo)
                        .collect(Collectors.toList()));
            }
        });

        return new ArrayList<>(menusUnicos);
    }

    @Transactional
    public Menu crear(Menu menu) {
        if (menu.getNombre() == null || menu.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del menú es obligatorio");
        }

        if (menuRepository.existsByNombreAndActivoTrue(menu.getNombre())) {
            throw new RuntimeException("Ya existe un menú activo con ese nombre");
        }

        if (menu.getMenuPadre() != null && menu.getMenuPadre().getId() != null) {
            Menu padre = menuRepository.findByIdAndActivoTrue(menu.getMenuPadre().getId())
                    .orElseThrow(() -> new RuntimeException("El menú padre no existe o está inactivo"));
            menu.setMenuPadre(padre);
        }

        return menuRepository.save(menu);
    }

    @Transactional
    public Menu actualizar(Menu menu) {
        if (menu.getId() == null) {
            throw new RuntimeException("El ID del menú es requerido");
        }

        Menu menuExistente = menuRepository.findByIdAndActivoTrue(menu.getId())
                .orElseThrow(() -> new RuntimeException("Menú no encontrado"));

        menuExistente.setNombre(menu.getNombre());
        menuExistente.setUrl(menu.getUrl());

        if (menu.getMenuPadre() != null && menu.getMenuPadre().getId() != null) {
            if (menu.getMenuPadre().getId().equals(menu.getId())) {
                throw new RuntimeException("Un menú no puede ser padre de sí mismo");
            }
            Menu padre = menuRepository.findByIdAndActivoTrue(menu.getMenuPadre().getId())
                    .orElseThrow(() -> new RuntimeException("El menú padre no existe o está inactivo"));
            menuExistente.setMenuPadre(padre);
        } else {
            menuExistente.setMenuPadre(null);
        }

        return menuRepository.save(menuExistente);
    }

    @Transactional
    public boolean eliminar(Integer id) {
        return menuRepository.findByIdAndActivoTrue(id)
                .map(menu -> {
                    menu.setActivo(false);
                    menuRepository.save(menu);
                    return true;
                })
                .orElse(false);
    }

    public Menu buscarPorId(Integer id) {
        return menuRepository.findByIdAndActivoTrue(id).orElse(null);
    }
}
