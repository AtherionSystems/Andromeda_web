# Vista Developer — Andromeda Web

> **Autores:** JaviSan, Paco · Branch: `DeveloperView`

Vista personal del desarrollador: todo lo que se muestra está acotado a **sus** proyectos y **sus** tareas (endpoints `/api/me/*`). El objetivo es que un developer responda en una pantalla: *¿qué tengo pendiente, cómo voy contra mis estimaciones y cómo va el sprint de mi equipo?*

## Pantallas

### 1. Dashboard (`/`)

| Card | Qué muestra | Fuente |
|---|---|---|
| **My Task Distribution** | Conteo de tareas propias por estatus (todo / in progress / review / done) | `GET /api/me/dashboard?projectId=` |
| **Hours Per Sprint** | Barras agrupadas *Estimated vs Actual* por sprint, con drift promedio y tendencia (sub/sobre-estimación) | `GET /api/me/dashboard?projectId=` |
| **My Tasks Per Sprint** | Tareas completadas por el usuario en cada sprint | `GET /api/me/dashboard?projectId=` |
| **Upcoming** | Tareas abiertas del usuario ordenadas por prioridad | `GET /api/me/tasks` |
| **Active Sprint Progress** | % de tareas done del sprint **activo** de cada proyecto del usuario (datos de todo el equipo). Si no hay sprint activo, muestra el último completado con la etiqueta *"Last sprint"* | `GET /api/projects/{id}/sprints` + `.../sprints/{sid}/tasks` |
| **Backend** (indicador compacto) | Disponibilidad del backend (verde/rojo) | `GET /health` |

- Las tres primeras cards se filtran con el **selector de proyecto** ("Dashboard project"), poblado con `GET /api/me/projects` — no hay proyectos hardcodeados.
- El selector solo lista proyectos donde el usuario es miembro; al entrar a un nuevo proyecto aparece automáticamente.

### 2. Projects (`/projects`)

Listado **solo lectura** de los proyectos donde el usuario es miembro (`scope="me"`). Reutiliza `ProjectsPage` (compartido con PO) parametrizado por props.

### 3. Backlog (`/backlog`)

Tablero kanban de las tareas **propias** (`scope="me"`) con columnas todo / in progress / review / done.

- El developer puede **cambiar el estatus** de sus tareas (`canUpdateStatus`); el cambio va por `PATCH /api/projects/{id}/tasks/{taskId}` con rollback optimista si falla.
- El estatus `revision` no existe en el backend: se envía como `in_progress` y la marca se guarda en `sessionStorage`.
- Tareas asignadas al usuario pero de proyectos donde **no** es miembro (asignaciones huérfanas en BD) se descartan en el cliente.

### 4. Settings (`/settings`)

Configuración general (tema oscuro, preferencias).

## Reglas de datos

1. **Todo pasa por la capa `src/api/`** — agrega el Bearer token de OCI IAM y cachea respuestas con TTL para deduplicar llamadas entre pantallas.
2. **Nada de datos de otros usuarios:** la vista no consume endpoints de equipo salvo el progreso del sprint activo, que es agregado (conteo done/total) de los proyectos del propio usuario.
3. **Limitación conocida:** `/api/me/dashboard` solo regresa `sprintName` (sin fechas ni IDs de sprint); si un usuario tiene varios proyectos con sprints homónimos, las analíticas del dashboard los agrupan por nombre. Resolverlo requeriría que el backend exponga fechas de sprint en ese endpoint.

## Historial de decisiones

- **Analytics dedicado eliminado** (commit `3df16c6`): el equipo acordó que el dashboard ya cubre las analíticas personales filtradas por proyecto; mantener una sección aparte duplicaba la historia.
- **System Config compactado** (commit `6a12e3f`): la card original mostraba una fecha de deploy hardcodeada; se redujo a un indicador de salud de una línea que conserva el health check real.
- **Fallback de sprint** (commit `6a12e3f`): sin sprint activo, la card de progreso muestra el último completado en lugar de quedar vacía.
