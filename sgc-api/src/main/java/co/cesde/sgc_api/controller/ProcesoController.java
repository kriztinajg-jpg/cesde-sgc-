package co.cesde.sgc_api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.cesde.sgc_api.auth.AuthInterceptor;
import co.cesde.sgc_api.auth.UsuarioSesion;
import co.cesde.sgc_api.dto.ProcesoDto;
import co.cesde.sgc_api.repository.ProcesoRepository;

@RestController
@RequestMapping("/api/procesos")
public class ProcesoController {

    private final ProcesoRepository repository;

    public ProcesoController(ProcesoRepository repository) {
        this.repository = repository;
    }

    /** Devuelve solo los procesos y las áreas que el usuario tiene permitidos. */
    @GetMapping
    public List<ProcesoDto> listar(@RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario) {
        return repository.findAllByOrderByOrdenAsc().stream()
                .map(ProcesoDto::from)
                .map(p -> new ProcesoDto(p.id(), p.nombre(), p.tipo(),
                        p.areas().stream().filter(a -> usuario.puedeVerArea(a.id())).toList()))
                .filter(p -> !p.areas().isEmpty())
                .toList();
    }
}