package co.cesde.sgc_api.controller;

import co.cesde.sgc_api.model.CategoriaDocumento;
import co.cesde.sgc_api.repository.CategoriaDocumentoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaDocumentoRepository repository;

    public CategoriaController(CategoriaDocumentoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CategoriaDocumento> listar() {
        return repository.findAllByOrderByOrdenAsc();
    }
}
