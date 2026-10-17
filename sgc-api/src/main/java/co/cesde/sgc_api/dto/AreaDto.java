package co.cesde.sgc_api.dto;

import co.cesde.sgc_api.model.Area;

public record AreaDto(Integer id, String nombre, String descripcion) {

    public static AreaDto from(Area area) {
        return new AreaDto(area.getId(), area.getNombre(), area.getDescripcion());
    }
}
