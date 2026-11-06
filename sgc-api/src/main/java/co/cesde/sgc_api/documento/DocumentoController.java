package co.cesde.sgc_api.documento;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import co.cesde.sgc_api.auth.AuthInterceptor;
import co.cesde.sgc_api.auth.UsuarioSesion;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService servicio;

    public DocumentoController(DocumentoService servicio) {
        this.servicio = servicio;
    }

    /** Lista los documentos vigentes que el usuario puede ver. Filtros opcionales: areaId, categoriaId, q. */
    @GetMapping
    public List<DocumentoDto> listar(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario,
            @RequestParam(name = "areaId", required = false) Integer areaId,
            @RequestParam(name = "categoriaId", required = false) Integer categoriaId,
            @RequestParam(name = "q", required = false) String q) {
        return servicio.listar(usuario, areaId, categoriaId, q);
    }

    @GetMapping("/{id}")
    public DocumentoDto obtener(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario,
            @PathVariable("id") int id) {
        return servicio.obtener(usuario, id);
    }

    /** Sube un archivo nuevo (multipart/form-data). Solo administradores. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoDto> subir(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("areaId") Integer areaId,
            @RequestParam("categoriaId") Integer categoriaId,
            @RequestParam("titulo") String titulo,
            @RequestParam(name = "descripcion", required = false) String descripcion,
            @RequestParam(name = "version", defaultValue = "1.0") String version,
            @RequestParam(name = "restringido", defaultValue = "false") boolean restringido) {
        usuario.exigirAdministrador();
        DocumentoDto creado = servicio.subir(archivo, areaId, categoriaId, titulo, descripcion, version, restringido);
        return ResponseEntity.created(URI.create("/api/documentos/" + creado.id())).body(creado);
    }

    /** Edita los datos de un documento. Solo administradores. */
    @PutMapping("/{id}")
    public DocumentoDto actualizar(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario,
            @PathVariable("id") int id,
            @RequestBody ActualizarDocumentoRequest datos) {
        usuario.exigirAdministrador();
        return servicio.actualizar(id, datos.titulo(), datos.descripcion(), datos.version(), datos.restringido());
    }

    /** Elimina el documento (registro y archivo). Solo administradores. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario,
            @PathVariable("id") int id) {
        usuario.exigirAdministrador();
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /** Entrega el archivo: para verlo en el navegador (por defecto) o para descargarlo (?descargar=true). */
    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> archivo(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario,
            @PathVariable("id") int id,
            @RequestParam(name = "descargar", defaultValue = "false") boolean descargar) {
        DocumentoService.ArchivoDescarga a = servicio.cargarArchivo(usuario, id, descargar);
        ContentDisposition disposicion = (descargar ? ContentDisposition.attachment() : ContentDisposition.inline())
                .filename(a.nombre(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposicion.toString())
                .contentType(MediaType.parseMediaType(a.tipoMime()))
                .body(a.recurso());
    }
}