package co.cesde.sgc_api.repository;

import co.cesde.sgc_api.model.CategoriaDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaDocumentoRepository extends JpaRepository<CategoriaDocumento, Integer> {

    List<CategoriaDocumento> findAllByOrderByOrdenAsc();
}
