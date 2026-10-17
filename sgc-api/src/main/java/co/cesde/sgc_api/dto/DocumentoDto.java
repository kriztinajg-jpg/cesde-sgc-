package co.cesde.sgc_api.dto;

import co.cesde.sgc_api.model.Documento;
import java.time.LocalDateTime;

public record DocumentoDto(
        Integer id,
        String titulo,
        String descripcion,
        String archivoNombre,
        String archivoUrl,
        String tipoArchivo,
        String version,
        String estado,
        LocalDateTime fechaActualizacion) {

    public static DocumentoDto from(Documento d) {
        return new DocumentoDto(
                d.getId(),
                d.getTitulo(),
                d.getDescripcion(),
                d.getArchivoNombre(),
                d.getArchivoUrl(),
                d.getTipoArchivo(),
                d.getVersion(),
                d.getEstado(),
                d.getFechaActualizacion());
    }
}
