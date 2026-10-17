package co.cesde.sgc_api.controller;

import co.cesde.sgc_api.dto.ProcesoDto;
import co.cesde.sgc_api.repository.ProcesoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/procesos")
public class ProcesoController {

    private final ProcesoRepository repository;

    public ProcesoController(ProcesoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ProcesoDto> listar() {
        return repository.findAllByOrderByOrdenAsc().stream()
                .map(ProcesoDto::from)
                .toList();
    }
}
