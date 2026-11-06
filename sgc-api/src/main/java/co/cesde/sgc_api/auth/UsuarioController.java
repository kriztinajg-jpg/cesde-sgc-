package co.cesde.sgc_api.auth;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.cesde.sgc_api.auth.AdministracionUsuarios.UsuarioDto;

/** Administración de cuentas. Solo para administradores. */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    /** Lo que el frontend envía para crear un usuario. */
    public record NuevoUsuario(String nombre, String email, String clave, String rol,
                               Boolean verRestringidos, List<Integer> areas) {
    }

    /** Lo que el frontend envía para editar un usuario. Lo que no se envíe se conserva. */
    public record CambiosUsuario(String nombre, String rol, Boolean verRestringidos,
                                 Boolean activo, List<Integer> areas) {
    }

    /** Contraseña nueva definida por el administrador. */
    public record NuevaClave(String clave) {
    }

    private final UsuarioService usuarios;
    private final AdministracionUsuarios administracion;

    public UsuarioController(UsuarioService usuarios, AdministracionUsuarios administracion) {
        this.usuarios = usuarios;
        this.administracion = administracion;
    }

    @GetMapping
    public List<UsuarioDto> listar(@RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion quien) {
        quien.exigirAdministrador();
        return administracion.listar();
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

    @PutMapping("/{id}")
    public UsuarioDto actualizar(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion quien,
            @PathVariable("id") int id,
            @RequestBody CambiosUsuario datos) {
        quien.exigirAdministrador();
        return administracion.actualizar(id, datos.nombre(), datos.rol(), datos.verRestringidos(),
                datos.activo(), datos.areas());
    }

    @PutMapping("/{id}/clave")
    public ResponseEntity<Void> resetearClave(
            @RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion quien,
            @PathVariable("id") int id,
            @RequestBody NuevaClave datos) {
        quien.exigirAdministrador();
        administracion.resetearClave(id, datos.clave());
        return ResponseEntity.noContent().build();
    }
}