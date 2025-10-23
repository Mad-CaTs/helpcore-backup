package com.helpcore.ticket_service.repositorios;

import com.helpcore.ticket_service.entidades.ArchivoRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArchivoRespuestaRepository extends JpaRepository<ArchivoRespuesta, Integer> {

    @Query("SELECT a FROM ArchivoRespuesta a WHERE a.respuesta.id = :idRespuesta AND a.activo = true ORDER BY a.fechaCreacion ASC")
    List<ArchivoRespuesta> obtenerArchivosPorRespuesta(@Param("idRespuesta") Integer idRespuesta);

    @Query("SELECT a FROM ArchivoRespuesta a WHERE a.nombreAlmacenado = :nombreAlmacenado AND a.activo = true")
    Optional<ArchivoRespuesta> obtenerArchivoPorNombre(@Param("nombreAlmacenado") String nombreAlmacenado);
}