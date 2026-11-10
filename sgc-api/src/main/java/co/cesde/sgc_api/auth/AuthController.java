package co.cesde.sgc_api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarios;

    public AuthController(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    /** Inicia sesión. Devuelve los datos del usuario (perfil y áreas permitidas). */
    @PostMapping("/login")
    public UsuarioSesion login(@RequestBody LoginRequest datos, HttpServletRequest request) {
        if (datos == null || datos.email() == null || datos.clave() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe tu correo y tu contraseña.");
        }
        UsuarioSesion usuario = usuarios.autenticar(datos.email(), datos.clave());

        // Se descarta una sesión anterior y se crea una nueva (evita reutilizar sesiones viejas).
        HttpSession anterior = request.getSession(false);
        if (anterior != null) {
            anterior.invalidate();
        }
        HttpSession sesion = request.getSession(true);
        sesion.setAttribute(AuthInterceptor.SESION_USUARIO_ID, usuario.id());
        return usuario;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession sesion = request.getSession(false);
        if (sesion != null) {
            sesion.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    /** Devuelve el usuario de la sesión actual (el frontend lo usa al abrir la página). */
    @GetMapping("/me")
    public UsuarioSesion yo(@RequestAttribute(AuthInterceptor.USUARIO) UsuarioSesion usuario) {
        return usuario;
    }
}