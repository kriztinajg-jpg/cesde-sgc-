package co.cesde.sgc_api.auth;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Administración de cuentas. Solo para administradores. */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    /** Lo que el frontend envía para crear un usuario. */
    public record NuevoUsuario(String nombre, String email, String clave, String rol,
                               Boolean verRestringidos, List<Integer> areas) {
    }

    private final UsuarioService usuarios;

    public UsuarioController(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion quien,
            @RequestBody NuevoUsuario datos) {
        quien.exigirAdministrador();
        int id = usuarios.crear(datos.nombre(), datos.email(), datos.clave(), datos.rol(),
                Boolean.TRUE.equals(datos.verRestringidos()), datos.areas());
        return ResponseEntity.created(URI.create("/api/usuarios/" + id)).body(Map.of("id", id));
    }
}