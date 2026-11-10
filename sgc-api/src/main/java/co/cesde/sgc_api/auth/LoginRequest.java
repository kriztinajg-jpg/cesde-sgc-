package co.cesde.sgc_api.auth;

/** Lo que el frontend envía al iniciar sesión. */
public record LoginRequest(String email, String clave) {
}