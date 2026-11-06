package co.cesde.sgc_api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/** Revisa en cada petición a /api que haya una sesión iniciada. Si no, responde 401. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    /** Nombre con el que el usuario queda disponible en los controladores. */
    public static final String USUARIO = "usuarioActual";
    /** Nombre con el que el id del usuario se guarda en la sesión. */
    public static final String SESION_USUARIO_ID = "usuarioId";

    private final UsuarioService usuarios;

    public AuthInterceptor(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        HttpSession sesion = request.getSession(false);
        Object id = (sesion == null) ? null : sesion.getAttribute(SESION_USUARIO_ID);
        if (!(id instanceof Integer usuarioId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
        }
        request.setAttribute(USUARIO, usuarios.cargarSesion(usuarioId));
        return true;
    }
}