package com.helpcore.repositorios;

import java.util.List;
import java.util.Optional;

import com.helpcore.entidades.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.helpcore.entidades.Usuario;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer>{
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    List<Usuario> findByRolesContaining(Rol rol);
}
