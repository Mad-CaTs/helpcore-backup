package com.helpcore.ticket_service.servicios;


import com.helpcore.ticket_service.entidades.Sede;
import com.helpcore.ticket_service.repositorios.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SedeService {

    private final SedeRepository sedeRepository;

    public List<Sede> listarActivas() {
        return sedeRepository.findByActivoTrue();
    }
    public Sede buscarPorId(Integer id) {
        return sedeRepository.findById(id).orElse(null);
    }
}