package co.cesde.sgc_api.documento;

/** Lo que el frontend recibe de cada documento. */
public record DocumentoDto(
        int id,
        int areaId,
        int categoriaId,
        String titulo,
        String descripcion,
        String archivoNombre,
        String tipoArchivo,
        Long tamanoBytes,
        String version,
        String estado,
        String fechaActualizacion) {
}