package co.cesde.sgc_api.documento;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import co.cesde.sgc_api.auth.UsuarioSesion;

@Service
public class DocumentoService {

    private static final Set<String> EXTENSIONES_PERMITIDAS =
            Set.of("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg");

    private static final Map<String, String> MIME = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"));

    private static final String COLUMNAS =
            "id, area_id, categoria_id, titulo, descripcion, archivo_nombre, "
                    + "tipo_archivo, tamano_bytes, version, estado, fecha_actualizacion, restringido";

    private static final RowMapper<DocumentoDto> MAPPER = (rs, n) -> new DocumentoDto(
            rs.getInt("id"),
            rs.getInt("area_id"),
            rs.getInt("categoria_id"),
            rs.getString("titulo"),
            rs.getString("descripcion"),
            rs.getString("archivo_nombre"),
            rs.getString("tipo_archivo"),
            rs.getObject("tamano_bytes") == null ? null : rs.getLong("tamano_bytes"),
            rs.getString("version"),
            rs.getString("estado"),
            rs.getTimestamp("fecha_actualizacion").toLocalDateTime().toString(),
            rs.getBoolean("restringido"));

    /** Archivo listo para enviar al navegador. */
    public record ArchivoDescarga(Resource recurso, String nombre, String tipoMime) {
    }

    private final JdbcTemplate jdbc;
    private final Path raiz;

    public DocumentoService(JdbcTemplate jdbc, @Value("${app.storage.dir:uploads}") String directorio)
            throws IOException {
        this.jdbc = jdbc;
        this.raiz = Path.of(directorio).toAbsolutePath().normalize();
        Files.createDirectories(this.raiz);
    }

    /** Lista solo los documentos vigentes que el usuario tiene permitido ver. */
    public List<DocumentoDto> listar(UsuarioSesion usuario, Integer areaId, Integer categoriaId, String q) {
        StringBuilder sql = new StringBuilder(
                "SELECT " + COLUMNAS + " FROM documento WHERE estado = 'vigente'");
        List<Object> args = new ArrayList<>();

        // Permisos: el administrador ve todo; los demás, solo las áreas que se les otorgó.
        if (!usuario.esAdministrador()) {
            if (usuario.areas().isEmpty()) {
                return List.of();
            }
            sql.append(" AND area_id IN (")
                    .append(String.join(",", Collections.nCopies(usuario.areas().size(), "?")))
                    .append(")");
            args.addAll(usuario.areas());
        }
        // Los restringidos solo los ve el administrador o quien tenga ese permiso.
        if (!(usuario.esAdministrador() || usuario.verRestringidos())) {
            sql.append(" AND restringido = FALSE");
        }

        if (areaId != null) {
            sql.append(" AND area_id = ?");
            args.add(areaId);
        }
        if (categoriaId != null) {
            sql.append(" AND categoria_id = ?");
            args.add(categoriaId);
        }
        if (q != null && !q.isBlank()) {
            sql.append(" AND (titulo LIKE ? OR descripcion LIKE ?)");
            String patron = "%" + q.trim() + "%";
            args.add(patron);
            args.add(patron);
        }
        sql.append(" ORDER BY fecha_actualizacion DESC, id DESC");
        return jdbc.query(sql.toString(), MAPPER, args.toArray());
    }

    public DocumentoDto obtener(UsuarioSesion usuario, int id) {
        DocumentoDto documento = buscar(id);
        validarAcceso(usuario, documento);
        return documento;
    }

    public DocumentoDto subir(MultipartFile archivo, int areaId, int categoriaId,
                              String titulo, String descripcion, String version, boolean restringido) {
        if (archivo == null || archivo.isEmpty()) {
            throw error("Selecciona un archivo para subir.");
        }
        validarTexto(titulo, descripcion);
        String versionLimpia = (version == null || version.isBlank()) ? "1.0" : version.trim();
        if (versionLimpia.length() > 20) {
            throw error("La versión no puede superar 20 caracteres.");
        }
        existe("area", areaId, "El área no existe.");
        existe("categoria_documento", categoriaId, "La categoría no existe.");

        String nombreOriginal = nombreSeguro(archivo.getOriginalFilename());
        String ext = extension(nombreOriginal);
        if (!EXTENSIONES_PERMITIDAS.contains(ext)) {
            throw error("Tipo de archivo no permitido. Usa: " + String.join(", ", EXTENSIONES_PERMITIDAS) + ".");
        }

        String relativa = areaId + "/" + categoriaId + "/" + UUID.randomUUID() + "." + ext;
        Path destino = raiz.resolve(relativa).normalize();
        if (!destino.startsWith(raiz)) {
            throw error("Nombre de archivo no válido.");
        }
        try {
            Files.createDirectories(destino.getParent());
            try (InputStream in = archivo.getInputStream()) {
                Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo guardar el archivo en el servidor.");
        }

        KeyHolder llave = new GeneratedKeyHolder();
        try {
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO documento (area_id, categoria_id, titulo, descripcion, archivo_nombre, "
                                + "archivo_url, tipo_archivo, tamano_bytes, version, restringido) "
                                + "VALUES (?,?,?,?,?,?,?,?,?,?)",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, areaId);
                ps.setInt(2, categoriaId);
                ps.setString(3, titulo.trim());
                ps.setString(4, (descripcion == null || descripcion.isBlank()) ? null : descripcion.trim());
                ps.setString(5, nombreOriginal);
                ps.setString(6, relativa);
                ps.setString(7, ext);
                ps.setLong(8, archivo.getSize());
                ps.setString(9, versionLimpia);
                ps.setBoolean(10, restringido);
                return ps;
            }, llave);
        } catch (RuntimeException e) {
            // Si la base de datos falla, no dejamos el archivo huérfano en disco.
            try {
                Files.deleteIfExists(destino);
            } catch (IOException ignorado) {
                // nada que hacer
            }
            throw e;
        }
        Number id = llave.getKey();
        return buscar(id.intValue());
    }

    /** Edita título, descripción, versión y la marca de restringido. Si "restringido" no viene, se conserva. */
    public DocumentoDto actualizar(int id, String titulo, String descripcion, String version, Boolean restringido) {
        DocumentoDto actual = buscar(id);
        validarTexto(titulo, descripcion);
        String versionLimpia = (version == null || version.isBlank()) ? actual.version() : version.trim();
        if (versionLimpia.length() > 20) {
            throw error("La versión no puede superar 20 caracteres.");
        }
        boolean marca = (restringido != null) ? restringido : actual.restringido();
        jdbc.update("UPDATE documento SET titulo = ?, descripcion = ?, version = ?, restringido = ? WHERE id = ?",
                titulo.trim(),
                (descripcion == null || descripcion.isBlank()) ? null : descripcion.trim(),
                versionLimpia, marca, id);
        return buscar(id);
    }

    /** Entrega el archivo. Para descargarlo (no solo verlo) el perfil debe permitirlo. */
    public ArchivoDescarga cargarArchivo(UsuarioSesion usuario, int id, boolean descargar) {
        validarAcceso(usuario, buscar(id));
        if (descargar && !usuario.puedeDescargar()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu perfil no permite descargar archivos.");
        }

        List<String> filas = jdbc.query(
                "SELECT CONCAT(archivo_url, '|', archivo_nombre, '|', IFNULL(tipo_archivo, '')) "
                        + "FROM documento WHERE id = ?",
                (rs, n) -> rs.getString(1), id);
        if (filas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El documento no existe.");
        }
        String[] partes = filas.get(0).split("\\|", 3);
        Path ruta = raiz.resolve(partes[0]).normalize();
        if (!ruta.startsWith(raiz) || !Files.isRegularFile(ruta)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "El archivo ya no está disponible en el servidor.");
        }
        String mime = MIME.getOrDefault(partes.length > 2 ? partes[2] : "", "application/octet-stream");
        return new ArchivoDescarga(new PathResource(ruta), partes[1], mime);
    }

    /** Elimina el registro de la base de datos y el archivo guardado en disco. */
    public void eliminar(int id) {
        List<String> rutas = jdbc.query(
                "SELECT archivo_url FROM documento WHERE id = ?",
                (rs, n) -> rs.getString(1), id);
        if (rutas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El documento no existe.");
        }
        jdbc.update("DELETE FROM documento WHERE id = ?", id);

        // Con el registro ya eliminado, se borra el archivo del disco.
        Path ruta = raiz.resolve(rutas.get(0)).normalize();
        if (ruta.startsWith(raiz)) {
            try {
                Files.deleteIfExists(ruta);
            } catch (IOException e) {
                // El registro ya no existe; si el archivo no se pudo borrar, no es un error para el usuario.
            }
        }
    }

    // ---------- utilidades ----------

    private DocumentoDto buscar(int id) {
        List<DocumentoDto> r = jdbc.query(
                "SELECT " + COLUMNAS + " FROM documento WHERE id = ?", MAPPER, id);
        if (r.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El documento no existe.");
        }
        return r.get(0);
    }

    /** Responde 403 si el usuario no puede ver el área del documento o si es restringido y no tiene permiso. */
    private void validarAcceso(UsuarioSesion usuario, DocumentoDto documento) {
        boolean areaPermitida = usuario.puedeVerArea(documento.areaId());
        boolean restringidoPermitido = !documento.restringido()
                || usuario.esAdministrador() || usuario.verRestringidos();
        if (!areaPermitida || !restringidoPermitido) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver este documento.");
        }
    }

    private void validarTexto(String titulo, String descripcion) {
        if (titulo == null || titulo.isBlank()) {
            throw error("El título es obligatorio.");
        }
        if (titulo.length() > 200) {
            throw error("El título no puede superar 200 caracteres.");
        }
        if (descripcion != null && descripcion.length() > 500) {
            throw error("La descripción no puede superar 500 caracteres.");
        }
    }

    private void existe(String tabla, int id, String mensaje) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM " + tabla + " WHERE id = ?", Integer.class, id);
        if (n == null || n == 0) {
            throw error(mensaje);
        }
    }

    private static String nombreSeguro(String original) {
        if (original == null || original.isBlank()) {
            throw error("El archivo no tiene nombre.");
        }
        String nombre = original.replace('\\', '/');
        nombre = nombre.substring(nombre.lastIndexOf('/') + 1).trim();
        if (nombre.isEmpty() || nombre.contains("..")) {
            throw error("Nombre de archivo no válido.");
        }
        return nombre.length() > 255 ? nombre.substring(nombre.length() - 255) : nombre;
    }

    private static String extension(String nombre) {
        int punto = nombre.lastIndexOf('.');
        return punto < 0 ? "" : nombre.substring(punto + 1).toLowerCase();
    }

    private static ResponseStatusException error(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }
}