-- =====================================================
-- CESDE SGC - Datos semilla (mapa estratégico de procesos)
-- Ejecutar DESPUÉS de schema.sql
-- =====================================================
USE cesde_sgc;

INSERT INTO proceso (id, nombre, tipo, orden) VALUES
  (1, 'Proceso Estratégico', 'estrategico', 1),
  (2, 'Procesos Misionales', 'misional',    2),
  (3, 'Procesos de Apoyo',   'apoyo',       3),
  (4, 'Proceso de Control',  'control',     4);

INSERT INTO area (proceso_id, nombre, orden) VALUES
  (1, 'Rectoría', 1),
  (2, 'Dirección Académica', 1),
  (2, 'Conexión de Negocios', 2),
  (3, 'Jurídica', 1),
  (3, 'Talento Cesde', 2),
  (3, 'Vicerrectoría Administrativa y Financiera', 3),
  (3, 'Proyectos y Empleo', 4),
  (3, 'Comunicaciones', 5),
  (4, 'Auditoría y Calidad', 1);

INSERT INTO categoria_documento (nombre, orden) VALUES
  ('Caracterización', 1),
  ('Procedimientos', 2),
  ('Formatos', 3),
  ('Documentos', 4),
  ('Riesgos', 5),
  ('Indicadores', 6),
  ('Planes de mejora', 7);

-- El usuario administrador se crea desde el backend (con la contraseña
-- hasheada), no desde SQL, para no guardar credenciales en el repositorio.
