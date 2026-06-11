# Vista Product Owner — Andromeda Web

> **Autores:** JaviSan, Paco · Rama: `main`

Vista de gestión completa del Product Owner: administra todos los proyectos del sistema, sus sprints, backlog del equipo y métricas de rendimiento. El objetivo es que un PO responda en una pantalla: *¿cómo van los proyectos, quién está trabajando en qué, y cómo evoluciona la velocidad del equipo?*

## Pantallas

### 1. Dashboard (`/`)

Resumen general del estado de todos los proyectos. Título: *"Projects Overview"*.

| Card | Qué muestra | Fuente |
|---|---|---|
| **Sprint Velocity Chart** | Barras apiladas por proyecto con conteo de tareas por estatus (todo / in progress / review / done) | `GET /api/projects` + `GET /api/projects/{id}/tasks` |
| **Team Distribution** | Miembros de cada proyecto con su rol; agrupa por proyecto ordenado por tamaño de equipo | `GET /api/project-members` |
| **Current Objectives** | Tareas abiertas de todos los proyectos ordenadas por prioridad | `GET /api/projects/{id}/tasks` |
| **Upcoming** | Mismas tareas abiertas ordenadas por prioridad (vista de lista lateral) | `GET /api/projects/{id}/tasks` |
| **System Config** (indicador) | Disponibilidad del backend (verde/rojo) | `GET /health` |

- Todas las cards se cargan en paralelo (`Promise.allSettled`); el fallo de un proyecto no bloquea el resto.

### 2. Projects (`/projects`)

Gestión completa (CRUD) de proyectos.

- Lista todos los proyectos del sistema (`GET /api/projects`).
- El PO puede **crear**, **editar** y **eliminar** proyectos.
- Desde la ficha de cada proyecto puede **agregar/quitar miembros** y **gestionar sprints** (crear, editar estado, eliminar).
- Los cambios de estado de sprint (planned → active → completed) se realizan desde esta sección.

### 3. Backlog (`/backlog`)

Backlog completo del equipo con acceso de escritura total (`isPOView`).

- Muestra tareas de todos los proyectos (sin filtro de usuario).
- El PO puede **crear tareas**, **editar tareas**, **eliminar tareas** y **asignarlas a sprints**.
- El cambio de estatus de una tarea persiste vía `PATCH /api/projects/{id}/tasks/{taskId}` con rollback optimista si falla.
- El estatus `revision` no existe en el backend: se envía como `in_progress` y la marca se guarda en `sessionStorage`.

### 4. Analytics (`/analytics`)

Métricas del equipo filtradas por proyecto.

| Métrica | Qué muestra | Fuente |
|---|---|---|
| **Sprint Velocity** | Puntos completados en el último sprint y variación vs. el anterior | `GET /api/dashboard?projectId=` |
| **Completion Rate** | % de tareas en estado done sobre el total | `GET /api/dashboard?projectId=` |
| **Sprint Completion Rate** | Burndown por sprint (historias restantes vs. línea ideal) | `GET /api/dashboard?projectId=` |
| **Individual Performance** | Horas estimadas/reales y tareas completadas por integrante en cada sprint | `GET /api/dashboard?projectId=` |
| **Team Velocity** | Barras de puntos planeados vs. completados por sprint | `GET /api/dashboard?projectId=` |
| **Task Distribution** | Pie chart de tareas por estatus | `GET /api/dashboard?projectId=` |
| **Team Task Completion** | % de tareas completadas por integrante respecto al total del equipo | `GET /api/dashboard?projectId=` |

- El selector de proyecto popula `GET /api/projects` y refresca todos los KPIs al cambiar la selección.

### 5. Settings (`/settings`)

Configuración general (tema oscuro, preferencias).

## Reglas de datos

1. **Todo pasa por la capa `src/api/`** — agrega el Bearer token de OCI IAM y cachea respuestas con TTL para deduplicar llamadas entre pantallas.
2. **Acceso global:** la vista PO no filtra por membresía del usuario autenticado; puede ver y modificar todos los proyectos.
3. **Componentes compartidos con Developer** (`BacklogPage`, `ProjectsPage`, `Sidebar`): se parametrizan por props/rol; los cambios de la vista PO no alteran el comportamiento del Developer.

## Historial de decisiones

- **AnalyticsPage separada del Dashboard:** el equipo acordó que las métricas de KPI del equipo merecen su propia sección, mientras el Dashboard sirve como resumen rápido de estado.
- **isPOView en BacklogPage:** habilita acciones de escritura avanzadas (crear tarea, asignar a sprint) que están deshabilitadas para el Developer.
- **getDashboardKPI usa `/api/dashboard`** (no `/api/me/dashboard`): el endpoint de equipo devuelve KPIs agregados del proyecto completo, no solo del usuario autenticado.
