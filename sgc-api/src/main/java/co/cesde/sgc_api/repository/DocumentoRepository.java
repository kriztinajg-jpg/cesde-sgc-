package co.cesde.sgc_api.repository;

import co.cesde.sgc_api.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentoRepository extends JpaRepository<Documento, Integer> {

    List<Documento> findByAreaIdAndEstadoOrderByTituloAsc(Integer areaId, String estado);

    List<Documento> findByAreaIdAndCategoriaIdAndEstadoOrderByTituloAsc(
            Integer areaId, Integer categoriaId, String estado);
}
