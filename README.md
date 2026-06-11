# Andromeda Web

Frontend web de **Atherion Systems / Andromeda**: sistema integral de gestión de proyectos ágiles (proyectos, sprints, backlog y KPIs) con vistas dedicadas por rol — **Developer** y **Product Owner (PO)** — autenticación contra **OCI IAM (IDCS)** y backend Spring Boot desplegado en **Oracle Cloud (OKE)**.

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS 4 + componentes shadcn/ui |
| Gráficas | Recharts |
| Autenticación | OAuth2 / PKCE contra OCI IAM (IDCS) |
| Backend (repo aparte) | Spring Boot en OKE + Oracle Autonomous DB |
| Tests | Vitest + jsdom |

## Ejecución local

```bash
npm install
npm run dev        # https://localhost:5173 (puerto fijo, requerido por el redirect de OCI)
```

- Configura las variables `VITE_OCI_*` en `.env` (cliente PKCE de OCI IAM).
- En desarrollo, Vite **proxea** `/api` y `/health` al backend desplegado (ver `vite.config.ts`); no necesitas backend local.
- `VITE_API_BASE_URL` solo se usa en builds de producción.

```bash
npm run build      # build de producción
npx tsc --noEmit   # type-check
npx vitest run     # tests
```

## Documentación

| Documento | Contenido |
|---|---|
| [Arquitectura C4](docs/arquitectura-c4.md) | Niveles de contexto, contenedores y componentes (Developer y PO) |
| [Vista Developer](docs/developer/README.md) | Funcionalidad, pantallas y endpoints de la vista de desarrollador |
| [Requerimientos Developer](docs/developer/requerimientos.md) | HU, RF y RNF de la vista de desarrollador |
| [Vista PO](docs/po/README.md) | Funcionalidad, pantallas y endpoints de la vista de Product Owner |
| [Requerimientos PO](docs/po/requerimientos.md) | HU, RF y RNF de la vista de Product Owner |

> Cada vista documenta en su propia carpeta (`docs/developer/`, `docs/po/`). El README raíz y el C4 de niveles 1–2 son compartidos; el nivel 3 (componentes) se documenta por vista.

## Estructura del proyecto

```
src/
├── api/              # Clientes HTTP por dominio + caché TTL
│   ├── me.ts         # Endpoints /api/me/* (proyectos, tareas y dashboard del usuario)
│   ├── projects.ts   # CRUD de proyectos y sprints
│   ├── tasks.ts      # CRUD de tareas y asignaciones
│   ├── members.ts    # Gestión de miembros por proyecto
│   ├── dashboard.ts  # KPIs de equipo (/api/dashboard)
│   ├── health.ts     # Probe de disponibilidad del backend
│   ├── auth.ts       # Utilidades de autenticación OCI
│   └── client.ts     # Función base apiFetch (Bearer token, manejo de errores)
├── components/
│   ├── Analytics-KPI/ # Gráficas de KPIs del equipo (solo vista PO)
│   ├── Backlog/       # Tablero kanban (compartido Developer/PO vía props)
│   ├── Layout/        # AppLayout, Footer y LegalModal
│   ├── Projects/      # Gestión de proyectos, sprints y capabilities
│   ├── Sidebar/       # Navegación por rol (DEV_NAV / PO_NAV)
│   ├── TelegramBot/   # Widget del bot de Telegram
│   ├── TopBar/        # Barra superior y menú de usuario
│   ├── dashboard/     # Cards del dashboard (compartidas Developer/PO)
│   └── ui/            # Primitivas shadcn/ui
├── contexts/          # Auth (sesión OCI) y tema (dark mode)
├── hooks/             # Hooks reutilizables (useAndromedaBot, useClickOutside, useWindowSize)
├── lib/               # Utilidades: caché TTL, helpers de usuario
├── pages/
│   ├── Developer/     # Vista Developer
│   ├── PO/            # Vista Product Owner
│   └── Login/         # Flujo PKCE (LoginPage, Callback, LoggedOut)
└── types/             # Tipos TypeScript de la API (api.ts, project.ts)
```

## Equipo de documentación

Arquitectura C4 y documentación de la vista Developer: **JaviSan, Paco**.
