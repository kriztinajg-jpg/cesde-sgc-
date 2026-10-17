package co.cesde.sgc_api.dto;

import co.cesde.sgc_api.model.Proceso;
import java.util.List;

public record ProcesoDto(Integer id, String nombre, String tipo, List<AreaDto> areas) {

    public static ProcesoDto from(Proceso proceso) {
        List<AreaDto> areas = proceso.getAreas().stream().map(AreaDto::from).toList();
        return new ProcesoDto(proceso.getId(), proceso.getNombre(), proceso.getTipo(), areas);
    }
}
