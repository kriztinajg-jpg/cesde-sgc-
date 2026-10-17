-- =====================================================
-- CESDE SGC - Esquema de base de datos (MySQL 8)
-- Versión sin tabla "usuario" (login y roles quedan para la fase 2)
-- =====================================================
CREATE DATABASE IF NOT EXISTS cesde_sgc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE cesde_sgc;

DROP TABLE IF EXISTS documento;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS categoria_documento;
DROP TABLE IF EXISTS area;
DROP TABLE IF EXISTS proceso;

-- Los 4 tipos de proceso del mapa estratégico
CREATE TABLE proceso (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  tipo        ENUM('estrategico','misional','apoyo','control') NOT NULL,
  color_hex   CHAR(7) NULL,
  orden       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_proceso_tipo (tipo)
) ENGINE=InnoDB;

-- Áreas dentro de cada proceso (Rectoría, Jurídica, etc.)
CREATE TABLE area (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proceso_id   INT UNSIGNED NOT NULL,
  nombre       VARCHAR(120) NOT NULL,
  descripcion  VARCHAR(255) NULL,
  orden        TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_area_proceso FOREIGN KEY (proceso_id)
    REFERENCES proceso (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_area_nombre (nombre)
) ENGINE=InnoDB;

-- Las 7 categorías fijas de documentos
CREATE TABLE categoria_documento (
  id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(60) NOT NULL,
  icono   VARCHAR(40) NULL,
  orden   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_categoria_nombre (nombre)
) ENGINE=InnoDB;

-- Documentos: un archivo pertenece a un área y a una categoría
CREATE TABLE documento (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  area_id              INT UNSIGNED NOT NULL,
  categoria_id         INT UNSIGNED NOT NULL,
  titulo               VARCHAR(200) NOT NULL,
  descripcion          VARCHAR(500) NULL,
  archivo_nombre       VARCHAR(255) NOT NULL,
  archivo_url          VARCHAR(500) NOT NULL,
  tipo_archivo         VARCHAR(20) NULL,
  tamano_bytes         BIGINT UNSIGNED NULL,
  version              VARCHAR(20) NOT NULL DEFAULT '1.0',
  estado               ENUM('vigente','obsoleto') NOT NULL DEFAULT 'vigente',
  fecha_creacion       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_area FOREIGN KEY (area_id)
    REFERENCES area (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_doc_categoria FOREIGN KEY (categoria_id)
    REFERENCES categoria_documento (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_doc_area_categoria (area_id, categoria_id),
  FULLTEXT KEY ft_doc_busqueda (titulo, descripcion)
) ENGINE=InnoDB;
