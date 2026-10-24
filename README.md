# SGC CESDE — Sistema de Gestión de Calidad digital

Aplicación web interactiva que digitaliza el Sistema de Gestión de Calidad del CESDE. Permite consultar y administrar la documentación institucional organizada por **proceso**, **área** y **categoría**, a partir del mapa estratégico de procesos que hoy está en Genially.

## Qué permite hacer

- Navegar el mapa estratégico de procesos (estratégico, misionales, de apoyo y de control) y sus **9 áreas**.
- Ver las **7 categorías** documentales de cada área: Caracterización, Procedimientos, Formatos, Documentos, Riesgos, Indicadores y Planes de mejora.
- **Subir** documentos (PDF, Word, Excel, PowerPoint e imágenes), **verlos** en el navegador y **descargarlos**.
- **Buscar** documentos por título o descripción.
- **Eliminar** documentos (disponible en la API; la interfaz todavía no tiene el botón).

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `sgc-api/` | Backend: API REST con Spring Boot 4, Java 21 y MySQL |
| `src/` | Frontend: React, Vite y Tailwind CSS |
| `database/` | Scripts de la base de datos (`schema.sql` y `seed.sql`) |
| `docs/` | Diagrama entidad-relación (`diagrama-er.png` y `diagrama-er.dbml`) |
| `mapa_de_procesos.png`, `vista_de_categorias.png` | Wireframes de referencia |

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Framer Motion |
| Backend | Spring Boot 4 (Java 21), Spring Data JPA y JdbcTemplate |
| Base de datos | MySQL 8 |

## Requisitos

- Java 21
- MySQL 8
- Node.js 20.19 o superior (se recomienda 22 o 24; con Node 18 el frontend no arranca)

## Cómo ejecutarlo

### 1. Base de datos

1. Abre MySQL (cliente de línea de comandos, Workbench o phpMyAdmin).
2. Ejecuta primero `database/schema.sql` y después `database/seed.sql`:

```sql
source C:/ruta/al/proyecto/database/schema.sql
source C:/ruta/al/proyecto/database/seed.sql
```

3. Verifica: `SELECT * FROM cesde_sgc.area;` debe devolver 9 áreas.

> **Ojo:** `schema.sql` borra y vuelve a crear las tablas. Si lo ejecutas de nuevo se pierden los registros de documentos.

### 2. Backend

La contraseña de MySQL **no se guarda en el repositorio**: se entrega con la variable de entorno `DB_PASSWORD`.

**Windows (PowerShell):**

```powershell
cd sgc-api
$env:DB_PASSWORD='tu_contraseña_de_mysql'
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**

```bash
cd sgc-api
export DB_PASSWORD='tu_contraseña_de_mysql'
./mvnw spring-boot:run
```

Cuando en la consola aparezca `Started SgcApiApplication`, abre <http://localhost:8080/health>. Debe responder `{"status":"ok"}`.

### 3. Frontend

En la raíz del repositorio, en otra terminal:

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal (normalmente <http://localhost:5173>). Las rutas `/api` se reenvían al backend (`http://localhost:8080`) mediante el proxy configurado en `vite.config.js`, así que el backend debe estar encendido.

> La interfaz toma la estructura del mapa (procesos, áreas y categorías) de `src/data/estructura.js`, cuyos ids coinciden con `database/seed.sql`. Los documentos sí se leen y escriben en la API. Los endpoints `/api/procesos` y `/api/categorias` están disponibles para conectar también la estructura con la base de datos.

## Modelo de datos

Cuatro tablas, todas con relaciones de uno a muchos. El detalle está en `docs/diagrama-er.png`.

| Relación | Se lee así | Llave foránea |
|---|---|---|
| `proceso` → `area` | Un proceso tiene varias áreas | `area.proceso_id` |
| `area` → `documento` | Un área tiene varios documentos | `documento.area_id` |
| `categoria_documento` → `documento` | Una categoría agrupa varios documentos | `documento.categoria_id` |

Cada documento guarda su `version` y su `estado` (`vigente` u `obsoleto`). La API solo lista los documentos vigentes. La tabla `usuario` (login y roles) quedó fuera de esta entrega y se plantea para la fase 2.

## API

URL base: `http://localhost:8080`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Comprueba que el backend funciona |
| GET | `/api/categorias` | Las 7 categorías, ordenadas |
| GET | `/api/procesos` | Los 4 procesos con sus áreas anidadas |
| GET | `/api/documentos` | Documentos vigentes. Filtros opcionales: `areaId`, `categoriaId`, `q` (texto) |
| GET | `/api/documentos/{id}` | Datos de un documento |
| GET | `/api/documentos/{id}/archivo` | Muestra el archivo en el navegador |
| GET | `/api/documentos/{id}/archivo?descargar=true` | Descarga el archivo |
| POST | `/api/documentos` | Sube un documento (ver parámetros abajo) |
| DELETE | `/api/documentos/{id}` | Elimina el documento y su archivo (204; 404 si no existe) |

**Parámetros de `POST /api/documentos`** (formato `multipart/form-data`):

| Campo | Obligatorio | Descripción |
|---|---|---|
| `archivo` | Sí | El archivo a subir |
| `areaId` | Sí | Id del área (1 a 9) |
| `categoriaId` | Sí | Id de la categoría (1 a 7) |
| `titulo` | Sí | Hasta 200 caracteres |
| `descripcion` | No | Hasta 500 caracteres |
| `version` | No | Por defecto `1.0` (hasta 20 caracteres) |

Si algo no es válido, la API responde un código 4xx con un JSON que incluye el campo `message` con la explicación (por ejemplo, tipo de archivo no permitido o área inexistente).

**Ejemplo de respuesta de `POST /api/documentos` (201):**

```json
{
  "id": 1,
  "areaId": 9,
  "categoriaId": 2,
  "titulo": "Documento de prueba",
  "descripcion": null,
  "archivoNombre": "prueba.png",
  "tipoArchivo": "png",
  "tamanoBytes": 78200,
  "version": "1.0",
  "estado": "vigente",
  "fechaActualizacion": "2026-10-22T21:14:57"
}
```

**Ejemplo de `GET /api/procesos` (resumido):**

```json
[
  {
    "id": 1,
    "nombre": "Proceso Estratégico",
    "tipo": "estrategico",
    "areas": [{ "id": 1, "nombre": "Rectoría", "descripcion": null }]
  }
]
```

El `tipo` llega sin tildes (`estrategico`, `misional`, `apoyo`, `control`); para mostrar en pantalla se usa `nombre`.

## Archivos subidos

- Formatos permitidos: `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `png`, `jpg`, `jpeg`.
- Tamaño máximo: **20 MB** por archivo.
- Los archivos se guardan en `sgc-api/uploads/{areaId}/{categoriaId}/`. Se puede cambiar la carpeta con la variable de entorno `STORAGE_DIR`.
- Git ignora esa carpeta: **los archivos subidos en un computador no aparecen en el de otra persona**, aunque la base de datos tenga el registro.

## Pruebas rápidas desde la terminal (PowerShell)

Con el backend encendido, estos comandos prueban todo el ciclo. Usa un archivo pequeño, con ruta sin espacios.

```powershell
# Subir
curl.exe -i -X POST http://localhost:8080/api/documentos -F "archivo=@C:/cesde-prueba/prueba.png" -F "areaId=9" -F "categoriaId=2" -F "titulo=Documento de prueba"

# Ver el archivo (abrir en el navegador)
#   http://localhost:8080/api/documentos/1/archivo
# Descargarlo
#   http://localhost:8080/api/documentos/1/archivo?descargar=true

# Eliminar
curl.exe -i -X DELETE http://localhost:8080/api/documentos/1
```

Cambia el `1` por el `id` que devuelva la subida.

## Flujo de trabajo (Git)

- Nadie trabaja directamente en `main` ni en `dev`.
- Cada tarea va en su rama `feature/nombre-corto`, creada desde `dev`.
- Se sube la rama y se abre un Pull Request hacia `dev`; otra persona del equipo lo revisa antes de unirlo.
- `dev` se une a `main` solo al cierre de cada sprint.
- Nunca se suben contraseñas, archivos `.env`, la carpeta `.idea`, `node_modules` ni `uploads`.
- Se sube solo la carpeta en la que se trabajó (por ejemplo, `git add sgc-api`), no todo con `git add .`.

## Solución de problemas

| Síntoma | Causa probable y solución |
|---|---|
| `npm run dev` falla con `styleText` | Node es demasiado viejo. Usa Node 20.19 o superior (`node -v` para revisar). |
| El frontend dice "No se pudo conectar con el servidor" | El backend está apagado o MySQL no está prendido. |
| El backend no arranca: `Access denied for user 'root'` | La variable `DB_PASSWORD` no está definida o es incorrecta. |
| El backend no arranca: `Communications link failure` | MySQL está apagado o usa otro puerto. |
| Puerto 8080 ocupado | Hay otra copia del backend abierta. Ciérrala con `Ctrl + C`. |
| Al subir, no responde nada o dice que el archivo es muy grande | El archivo supera los 20 MB. |
| Un documento aparece, pero no abre | El archivo no está en `sgc-api/uploads` de este computador (ver la sección de archivos subidos). |

## Estado del proyecto y fase 2

**Listo:** modelo de datos y diagrama ER, API de documentos (listar, buscar, subir, ver, descargar y eliminar), mapa interactivo con navegación proceso → área → categoría → documentos, y modales para subir y ver documentos.

**Fase 2:**

- Login y roles (hoy cualquiera con acceso a la aplicación puede subir o eliminar documentos).
- Botón de eliminar en la interfaz, protegido por permisos.
- Control de versiones de documentos.
- Almacenamiento compartido de los archivos y publicación en un servidor.
- Pruebas automáticas.