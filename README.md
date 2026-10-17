# SGC CESDE — Sistema de Gestión de Calidad digital

Aplicación web interactiva que digitaliza el Sistema de Gestión de Calidad del CESDE: permite consultar y organizar la documentación institucional por **proceso**, **área** y **categoría** (Caracterización, Procedimientos, Formatos, Documentos, Riesgos, Indicadores y Planes de mejora).

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `sgc-api/` | Backend: API REST con Spring Boot 4, Java 21 y MySQL |
| `database/` | Scripts de la base de datos (`schema.sql` y `seed.sql`) |
| `docs/` | Diagrama entidad-relación y wireframes |
| `src/` | Frontend: React + Vite + Tailwind CSS |

## Requisitos

- Java 21
- MySQL 8
- Node.js (versión LTS reciente)

## 1. Base de datos

1. Abre MySQL (cliente de línea de comandos, Workbench o phpMyAdmin).
2. Ejecuta primero `database/schema.sql` y después `database/seed.sql`.

```sql
source C:/ruta/al/proyecto/database/schema.sql
source C:/ruta/al/proyecto/database/seed.sql
```

3. Verifica que existan los datos: `SELECT * FROM cesde_sgc.area;` debe devolver 9 áreas.

> **Ojo:** `schema.sql` borra y vuelve a crear las tablas. Si lo ejecutas de nuevo, se pierden los documentos cargados.

## 2. Backend

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

## 3. Frontend

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal (normalmente <http://localhost:5173>). El backend permite llamadas desde ese puerto.

## API

URL base: `http://localhost:8080`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Comprueba que el backend está funcionando |
| GET | `/api/categorias` | Las 7 categorías documentales, ordenadas |
| GET | `/api/procesos` | Los 4 procesos con sus áreas anidadas |
| GET | `/api/areas/{id}/documentos` | Documentos vigentes de un área |
| GET | `/api/areas/{id}/documentos?categoriaId=2` | Documentos vigentes de un área filtrados por categoría |

Si un área no tiene documentos, `/api/areas/{id}/documentos` responde `[]` con código 200 (no es un error).

### Ejemplo: `GET /api/procesos`

```json
[
  {
    "id": 1,
    "nombre": "Proceso Estratégico",
    "tipo": "estrategico",
    "areas": [
      { "id": 1, "nombre": "Rectoría", "descripcion": null }
    ]
  }
]
```

- `tipo` llega sin tildes: `estrategico`, `misional`, `apoyo` o `control`. Para mostrar en pantalla se usa `nombre`.
- `descripcion` de las áreas puede venir vacía (`null`).

### Ejemplo: `GET /api/categorias`

```json
[
  { "id": 1, "nombre": "Caracterización", "icono": null, "orden": 1 },
  { "id": 2, "nombre": "Procedimientos", "icono": null, "orden": 2 }
]
```

### Ejemplo: `GET /api/areas/9/documentos?categoriaId=2`

```json
[
  {
    "id": 1,
    "titulo": "Procedimiento de auditoría interna",
    "descripcion": "Descripción del documento",
    "archivoNombre": "auditoria.pdf",
    "archivoUrl": "/archivos/auditoria.pdf",
    "tipoArchivo": "pdf",
    "version": "1.0",
    "estado": "vigente",
    "fechaActualizacion": "2026-10-14T10:30:00"
  }
]
```

## Flujo de trabajo (Git)

- Nadie trabaja directamente en `main` ni en `dev`.
- Cada tarea va en su rama `feature/nombre-corto`, creada desde `dev`.
- Se sube la rama y se abre un Pull Request hacia `dev`; otra persona del equipo lo revisa antes de unirlo.
- `dev` se une a `main` solo al cierre de cada sprint.
- Nunca se suben contraseñas, archivos `.env`, la carpeta `.idea` ni `node_modules`.
