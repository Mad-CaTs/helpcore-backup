package com.helpcore.servicios;

import com.helpcore.entidades.Menu;
import com.helpcore.repositorios.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    public Menu buscar(Integer id) {
        return menuRepository.findById(id).orElse(null);
    }

    public List<Menu> listar() {
        return menuRepository.listarActivos();
    }

    public Menu crear(Menu menu) {
        menu.setActivo(true);
        return menuRepository.save(menu);
    }

    public Menu actualizar(Menu menu) {
        Menu menuActual = buscar(menu.getId());
        if (menuActual != null && menuActual.isActivo()) {
            menuActual.setNombre(menu.getNombre());
            menuActual.setRuta(menu.getRuta());
            menuActual.setIcono(menu.getIcono());
            menuActual.setMenuPadre(menu.getMenuPadre());
            return menuRepository.save(menuActual);
        }
        return null;
    }

    public boolean eliminar(Integer id) {
        Menu menuActual = buscar(id);
        if (menuActual != null && menuActual.isActivo()) {
            menuActual.setActivo(false);
            menuRepository.save(menuActual);
            return true;
        }
        return false;
    }
}
