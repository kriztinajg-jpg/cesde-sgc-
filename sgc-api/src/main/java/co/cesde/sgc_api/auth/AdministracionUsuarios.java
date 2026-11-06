package co.cesde.sgc_api.auth;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Listar, editar, activar/desactivar usuarios y resetear contraseñas. Solo se usa desde el panel de administrador. */
@Service
public class AdministracionUsuarios {

    private static final Set<String> ROLES = Set.of("lector", "consultor", "administrador");

    /** Lo que el frontend recibe de cada usuario (nunca incluye la contraseña). */
    public record UsuarioDto(int id, String nombre, String email, String rol,
                             boolean verRestringidos, boolean activo, List<Integer> areas) {
    }

    private final JdbcTemplate jdbc;
    private final PasswordHasher hasher;

    public AdministracionUsuarios(JdbcTemplate jdbc, PasswordHasher hasher) {
        this.jdbc = jdbc;
        this.hasher = hasher;
    }

    public List<UsuarioDto> listar() {
        List<UsuarioDto> base = jdbc.query(
                "SELECT id, nombre, email, rol, ver_restringidos, activo FROM usuario ORDER BY id",
                (rs, n) -> new UsuarioDto(rs.getInt("id"), rs.getString("nombre"), rs.getString("email"),
                        rs.getString("rol"), rs.getBoolean("ver_restringidos"), rs.getBoolean("activo"), List.of()));

        List<int[]> pares = jdbc.query(
                "SELECT usuario_id, area_id FROM usuario_area ORDER BY area_id",
                (rs, n) -> new int[] { rs.getInt(1), rs.getInt(2) });
        Map<Integer, List<Integer>> areasPorUsuario = new HashMap<>();
        for (int[] par : pares) {
            areasPorUsuario.computeIfAbsent(par[0], k -> new ArrayList<>()).add(par[1]);
        }

        return base.stream()
                .map(u -> new UsuarioDto(u.id(), u.nombre(), u.email(), u.rol(), u.verRestringidos(),
                        u.activo(), areasPorUsuario.getOrDefault(u.id(), List.of())))
                .toList();
    }

    /**
     * Cambia nombre, perfil, permiso de restringidos, estado y áreas.
     * Lo que llegue vacío (null) se conserva como estaba.
     */
    @Transactional
    public UsuarioDto actualizar(int id, String nombre, String rol, Boolean verRestringidos,
                                 Boolean activo, List<Integer> areas) {
        UsuarioDto actual = buscar(id);

        String nombreNuevo = (nombre == null) ? actual.nombre() : nombre.trim();
        if (nombreNuevo.isBlank()) {
            throw error("El nombre es obligatorio.");
        }
        String rolNuevo = (rol == null) ? actual.rol() : rol;
        if (!ROLES.contains(rolNuevo)) {
            throw error("El perfil debe ser lector, consultor o administrador.");
        }
        boolean restringidosNuevo = (verRestringidos == null) ? actual.verRestringidos() : verRestringidos;
        boolean activoNuevo = (activo == null) ? actual.activo() : activo;

        // Siempre debe quedar al menos un administrador activo, o nadie podría gestionar las cuentas.
        boolean eraAdminActivo = actual.activo() && "administrador".equals(actual.rol());
        boolean seguiraAdminActivo = activoNuevo && "administrador".equals(rolNuevo);
        if (eraAdminActivo && !seguiraAdminActivo) {
            Integer otros = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM usuario WHERE rol = 'administrador' AND activo = TRUE AND id <> ?",
                    Integer.class, id);
            if (otros == null || otros == 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Debe quedar al menos un administrador activo.");
            }
        }

        List<Integer> areasNuevas = (areas == null) ? actual.areas() : areas.stream().distinct().toList();
        for (Integer areaId : areasNuevas) {
            Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM area WHERE id = ?", Integer.class, areaId);
            if (n == null || n == 0) {
                throw error("El área " + areaId + " no existe.");
            }
        }

        jdbc.update("UPDATE usuario SET nombre = ?, rol = ?, ver_restringidos = ?, activo = ? WHERE id = ?",
                nombreNuevo, rolNuevo, restringidosNuevo, activoNuevo, id);
        if (areas != null) {
            jdbc.update("DELETE FROM usuario_area WHERE usuario_id = ?", id);
            for (Integer areaId : areasNuevas) {
                jdbc.update("INSERT INTO usuario_area (usuario_id, area_id) VALUES (?,?)", id, areaId);
            }
        }
        return buscar(id);
    }

    /** El administrador define una contraseña nueva para el usuario. */
    public void resetearClave(int id, String clave) {
        if (clave == null || clave.length() < 8) {
            throw error("La contraseña debe tener al menos 8 caracteres.");
        }
        int filas = jdbc.update("UPDATE usuario SET password_hash = ? WHERE id = ?", hasher.hashear(clave), id);
        if (filas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe.");
        }
    }

    private UsuarioDto buscar(int id) {
        return listar().stream()
                .filter(u -> u.id() == id)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe."));
    }

    private static ResponseStatusException error(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }
}