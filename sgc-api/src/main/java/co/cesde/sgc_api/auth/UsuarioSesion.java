package co.cesde.sgc_api.auth;

import java.util.List;

/** Datos del usuario que ha iniciado sesión y sus permisos. */
public record UsuarioSesion(
        int id,
        String nombre,
        String email,
        String rol,
        boolean verRestringidos,
        List<Integer> areas) {

    public boolean esAdministrador() {
        return "administrador".equals(rol);
    }

    /** El lector solo ve en pantalla; consultor y administrador también descargan. */
    public boolean puedeDescargar() {
        return !"lector".equals(rol);
    }

    /** El administrador ve todas las áreas; los demás, solo las que se les otorgó. */
    public boolean puedeVerArea(int areaId) {
        return esAdministrador() || areas.contains(areaId);
    }
}