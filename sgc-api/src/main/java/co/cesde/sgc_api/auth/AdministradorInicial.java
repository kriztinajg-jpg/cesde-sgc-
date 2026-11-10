package co.cesde.sgc_api.auth;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Al arrancar, si no hay usuarios, crea el administrador inicial con la contraseña de ADMIN_PASSWORD. */
@Component
public class AdministradorInicial implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdministradorInicial.class);

    private final JdbcTemplate jdbc;
    private final UsuarioService usuarios;
    private final String email;
    private final String clave;

    public AdministradorInicial(JdbcTemplate jdbc, UsuarioService usuarios,
                                @Value("${app.admin.email}") String email,
                                @Value("${app.admin.password:}") String clave) {
        this.jdbc = jdbc;
        this.usuarios = usuarios;
        this.email = email;
        this.clave = clave;
    }

    @Override
    public void run(String... args) {
        try {
            Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM usuario", Integer.class);
            if (total != null && total > 0) {
                return;
            }
            if (clave.isBlank()) {
                log.warn("No hay usuarios y falta la variable ADMIN_PASSWORD: no se creó el administrador inicial.");
                return;
            }
            usuarios.crear("Administrador", email, clave, "administrador", true, List.of());
            log.info("Administrador inicial creado: {}", email);
        } catch (DataAccessException e) {
            log.error("No se pudo revisar la tabla usuario. ¿Ejecutaste database/002_login.sql?");
        }
    }
}