package com.helpcore.repositorios;

import com.helpcore.entidades.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    boolean existsByDni(String dni);
    boolean existsByCodigoAlumno(String codigoAlumno);

    Optional<Persona> findByDni(String dni);
    Optional<Persona> findByCodigoAlumno(String codigoAlumno);
}