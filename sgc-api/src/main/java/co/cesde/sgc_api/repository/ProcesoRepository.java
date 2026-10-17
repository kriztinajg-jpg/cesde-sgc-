package co.cesde.sgc_api.repository;

import co.cesde.sgc_api.model.Proceso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcesoRepository extends JpaRepository<Proceso, Integer> {

    // Trae cada proceso junto con sus áreas en una sola consulta
    @EntityGraph(attributePaths = "areas")
    List<Proceso> findAllByOrderByOrdenAsc();
}
