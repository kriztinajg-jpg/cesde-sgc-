package co.cesde.sgc_api.controller;

import co.cesde.sgc_api.dto.DocumentoDto;
import co.cesde.sgc_api.model.Documento;
import co.cesde.sgc_api.repository.DocumentoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class DocumentoController {

    private static final String ESTADO_VIGENTE = "vigente";

    private final DocumentoRepository repository;

    public DocumentoController(DocumentoRepository repository) {
        this.repository = repository;
    }

    // GET /api/areas/9/documentos?categoriaId=2
    // Si no hay documentos responde una lista vacía (200), no un error.
    @GetMapping("/{areaId}/documentos")
    public List<DocumentoDto> listar(
            @PathVariable Integer areaId,
            @RequestParam(required = false) Integer categoriaId) {

        List<Documento> documentos = (categoriaId == null)
                ? repository.findByAreaIdAndEstadoOrderByTituloAsc(areaId, ESTADO_VIGENTE)
                : repository.findByAreaIdAndCategoriaIdAndEstadoOrderByTituloAsc(
                        areaId, categoriaId, ESTADO_VIGENTE);

        return documentos.stream().map(DocumentoDto::from).toList();
    }
}
