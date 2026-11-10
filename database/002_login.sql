-- =====================================================
-- CESDE SGC - Login y permisos (ejecutar UNA sola vez,
-- después de schema.sql y seed.sql)
-- =====================================================
USE cesde_sgc;

CREATE TABLE usuario (
                         id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                         nombre           VARCHAR(120) NOT NULL,
                         email            VARCHAR(150) NOT NULL,
                         password_hash    VARCHAR(255) NOT NULL,
                         rol              ENUM('lector','consultor','administrador') NOT NULL DEFAULT 'lector',
                         ver_restringidos BOOLEAN NOT NULL DEFAULT FALSE,
                         activo           BOOLEAN NOT NULL DEFAULT TRUE,
                         fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;

-- Áreas que cada usuario puede ver
CREATE TABLE usuario_area (
                              usuario_id INT UNSIGNED NOT NULL,
                              area_id    INT UNSIGNED NOT NULL,
                              PRIMARY KEY (usuario_id, area_id),
                              CONSTRAINT fk_ua_usuario FOREIGN KEY (usuario_id)
                                  REFERENCES usuario (id) ON DELETE CASCADE,
                              CONSTRAINT fk_ua_area FOREIGN KEY (area_id)
                                  REFERENCES area (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Documentos confidenciales (ej. Revisión por la dirección)
ALTER TABLE documento
    ADD COLUMN restringido BOOLEAN NOT NULL DEFAULT FALSE;