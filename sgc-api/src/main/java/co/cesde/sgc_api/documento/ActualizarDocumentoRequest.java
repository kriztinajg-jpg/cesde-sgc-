package co.cesde.sgc_api.documento;

/** Lo que el frontend envía para editar los datos de un documento. */
public record ActualizarDocumentoRequest(
        String titulo,
        String descripcion,
        String version,
        Boolean restringido) {
}