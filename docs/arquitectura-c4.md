# Arquitectura C4 — Andromeda

> **Autores:** JaviSan, Paco · Niveles 1–2 cubren el sistema completo (compartidos entre branches). Nivel 3 documenta los componentes de la **vista Developer**; la vista PO agrega su propio nivel 3 en `docs/po/`.

## Nivel 1 — Contexto del sistema

```mermaid
C4Context
    title Contexto - Andromeda
    Person(dev, "Developer", "Miembro del equipo; consulta y actualiza sus tareas")
    Person(po, "Product Owner", "Gestiona proyectos, sprints y backlog del equipo")
    System(andromeda, "Andromeda", "Gestión de proyectos ágiles: proyectos, sprints, backlog y KPIs")
    System_Ext(ociiam, "OCI IAM (IDCS)", "Proveedor de identidad — OAuth2/PKCE")
    System_Ext(telegram, "Telegram", "Bot de tareas con IA")

    Rel(dev, andromeda, "Consulta dashboard, backlog y proyectos")
    Rel(po, andromeda, "Administra proyectos, sprints y KPIs")
    Rel(andromeda, ociiam, "Autentica usuarios", "OAuth2/PKCE")
    Rel(dev, telegram, "Gestiona tareas por chat")
    Rel(telegram, andromeda, "Crea/consulta tareas", "API REST")
```

## Nivel 2 — Contenedores

```mermaid
C4Container
    title Contenedores - Andromeda
    Person(user, "Usuario", "Developer o PO")

    System_Boundary(sys, "Andromeda") {
        Container(spa, "Andromeda Web (SPA)", "React 19 + TypeScript + Vite", "Vistas por rol, gráficas Recharts, caché TTL en cliente")
        Container(api, "Andromeda API", "Spring Boot sobre OKE", "Lógica de negocio, autorización por roles, KPIs")
        ContainerDb(db, "Base de datos", "Oracle Autonomous DB", "Proyectos, sprints, tareas, usuarios, asignaciones")
        Container(bot, "Bot de Telegram", "Python + IA", "Gestión de tareas conversacional")
    }
    System_Ext(idcs, "OCI IAM (IDCS)", "Identidad")

    Rel(user, spa, "Usa", "HTTPS")
    Rel(spa, idcs, "Login PKCE / tokens", "OAuth2")
    Rel(spa, api, "Consume", "REST + Bearer token (en dev vía proxy de Vite)")
    Rel(api, db, "Lee/escribe", "JDBC + Wallet")
    Rel(bot, api, "Consume", "REST")
```

**Despliegue:** la API y el frontend se contenerizan (Docker), se publican en Oracle Container Registry y corren en un clúster **OKE**; CI/CD con GitHub Actions. El frontend en desarrollo corre con Vite en `https://localhost:5173` y proxea `/api` y `/health` al backend desplegado.

## Nivel 3 — Componentes de la vista Developer (SPA)

```mermaid
C4Component
    title Componentes - Vista Developer
    Container_Boundary(spa, "Andromeda Web (SPA)") {
        Component(login, "Login / Callback", "React + PKCE", "Flujo OAuth2 contra IDCS; guarda tokens en sesión")
        Component(authctx, "AuthContext", "React Context", "Sesión del usuario y rol")
        Component(devpage, "DeveloperPage", "React", "Shell de la vista: enrutado interno + Sidebar (DEV_NAV)")
        Component(dash, "DeveloperDashboard", "React + Recharts", "Distribución de tareas, horas por sprint, tareas por sprint, próximas tareas, progreso del sprint activo (con fallback al último completado) e indicador de salud del backend")
        Component(backlog, "BacklogPage (scope=me)", "React", "Kanban de tareas propias con cambio de estatus")
        Component(projects, "ProjectsPage (scope=me, readOnly)", "React", "Proyectos donde el usuario es miembro")
        Component(apiclient, "Capa API (src/api)", "fetch + caché TTL", "me.ts, projects.ts, tasks.ts, health.ts — agrega Bearer token y deduplica requests")
    }
    System_Ext(api, "Andromeda API", "Spring Boot")

    Rel(login, authctx, "Inicializa sesión")
    Rel(devpage, dash, "Ruta /")
    Rel(devpage, projects, "Ruta /projects")
    Rel(devpage, backlog, "Ruta /backlog")
    Rel(dash, apiclient, "getMyProjects / getMyTasks / getMyDashboard / getProjectSprints / getSprintTasks / getHealth")
    Rel(backlog, apiclient, "getMyProjects / getMyTasks / updateTask")
    Rel(projects, apiclient, "getMyProjects")
    Rel(apiclient, api, "REST", "JSON + Bearer")
```

### Endpoints consumidos por la vista Developer

| Endpoint | Uso |
|---|---|
| `GET /health` | Indicador compacto de disponibilidad del backend |
| `GET /api/me/projects` | Proyectos donde el usuario autenticado es miembro |
| `GET /api/me/tasks` | Tareas asignadas al usuario (todas sus iniciativas) |
| `GET /api/me/dashboard?projectId=` | KPIs personales por proyecto: `myTaskDistribution`, `myHoursPerSprint`, `myTasksPerSprint` |
| `GET /api/projects/{id}/sprints` | Sprints del proyecto — la card de progreso usa el sprint `active` o, como fallback, el último `completed` |
| `GET /api/projects/{id}/sprints/{sid}/tasks` | Tareas del sprint para calcular el % de avance del equipo |
| `PATCH /api/projects/{id}/tasks/{taskId}` | Cambio de estatus de una tarea desde el backlog |

### Decisiones de diseño relevantes

- **Alcance "me":** toda la vista Developer consume endpoints `/api/me/*`; las tareas cuyo proyecto no aparece en la membresía del usuario se descartan en el cliente (asignaciones huérfanas en BD).
- **Caché TTL en cliente** (`src/lib/cache.ts`): deduplica llamadas repetidas entre dashboard y backlog dentro de la misma sesión.
- **Estatus `revision`:** el backend no lo soporta; se mapea a `in_progress` en el wire y se persiste localmente en `sessionStorage`.
- **Componentes compartidos con PO** (`BacklogPage`, `ProjectsPage`, `Sidebar`): se parametrizan con `scope`/listas de navegación por rol en lugar de duplicarse; los cambios de esta branch no alteran el comportamiento de PO.

## Nivel 3 — Componentes de la vista PO

_Pendiente — se documenta en la branch del PO (`docs/po/`)._
