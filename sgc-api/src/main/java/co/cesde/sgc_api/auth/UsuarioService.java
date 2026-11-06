package co.cesde.sgc_api.auth;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

    private static final Set<String> ROLES = Set.of("lector", "consultor", "administrador");

    private record Credencial(int id, String hash, boolean activo) {
    }

    private final JdbcTemplate jdbc;
    private final PasswordHasher hasher;

    public UsuarioService(JdbcTemplate jdbc, PasswordHasher hasher) {
        this.jdbc = jdbc;
        this.hasher = hasher;
    }

    /** Valida correo y contraseña. Si algo falla, responde 401 sin decir cuál de los dos. */
    public UsuarioSesion autenticar(String email, String clave) {
        List<Credencial> filas = jdbc.query(
                "SELECT id, password_hash, activo FROM usuario WHERE email = ?",
                (rs, n) -> new Credencial(rs.getInt("id"), rs.getString("password_hash"), rs.getBoolean("activo")),
                email.trim().toLowerCase());
        if (filas.isEmpty() || !filas.get(0).activo() || !hasher.coincide(clave, filas.get(0).hash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos.");
        }
        return cargarSesion(filas.get(0).id());
    }

    /** Carga el usuario con sus áreas. Se usa en cada petición, así los cambios de permisos aplican de inmediato. */
    public UsuarioSesion cargarSesion(int id) {
        List<UsuarioSesion> filas = jdbc.query(
                "SELECT id, nombre, email, rol, ver_restringidos FROM usuario WHERE id = ? AND activo = TRUE",
                (rs, n) -> new UsuarioSesion(rs.getInt("id"), rs.getString("nombre"), rs.getString("email"),
                        rs.getString("rol"), rs.getBoolean("ver_restringidos"), List.of()),
                id);
        if (filas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión ya no es válida.");
        }
        UsuarioSesion u = filas.get(0);
        List<Integer> areas = jdbc.queryForList(
                "SELECT area_id FROM usuario_area WHERE usuario_id = ?", Integer.class, id);
        return new UsuarioSesion(u.id(), u.nombre(), u.email(), u.rol(), u.verRestringidos(), areas);
    }

    /** Crea un usuario con sus áreas permitidas. Devuelve el id nuevo. */
    public int crear(String nombre, String email, String clave, String rol,
                     boolean verRestringidos, List<Integer> areas) {
        if (nombre == null || nombre.isBlank()) {
            throw error("El nombre es obligatorio.");
        }
        if (email == null || !email.contains("@")) {
            throw error("El correo no es válido.");
        }
        if (clave == null || clave.length() < 8) {
            throw error("La contraseña debe tener al menos 8 caracteres.");
        }
        if (!ROLES.contains(rol)) {
            throw error("El perfil debe ser lector, consultor o administrador.");
        }
        List<Integer> areasLimpias = areas == null ? List.of() : areas.stream().distinct().toList();
        for (Integer areaId : areasLimpias) {
            Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM area WHERE id = ?", Integer.class, areaId);
            if (n == null || n == 0) {
                throw error("El área " + areaId + " no existe.");
            }
        }

        KeyHolder llave = new GeneratedKeyHolder();
        try {
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO usuario (nombre, email, password_hash, rol, ver_restringidos) "
                                + "VALUES (?,?,?,?,?)",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, nombre.trim());
                ps.setString(2, email.trim().toLowerCase());
                ps.setString(3, hasher.hashear(clave));
                ps.setString(4, rol);
                ps.setBoolean(5, verRestringidos);
                return ps;
            }, llave);
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo.");
        }

        int id = llave.getKey().intValue();
        for (Integer areaId : areasLimpias) {
            jdbc.update("INSERT INTO usuario_area (usuario_id, area_id) VALUES (?,?)", id, areaId);
        }
        return id;
    }

    private static ResponseStatusException error(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }
}