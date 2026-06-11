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
| [Arquitectura C4](docs/arquitectura-c4.md) | Niveles de contexto, contenedores y componentes |
| [Vista Developer](docs/developer/README.md) | Funcionalidad, pantallas y endpoints de la vista de desarrollador |
| [Requerimientos Developer](docs/developer/requerimientos.md) | HU, RF y RNF de la vista de desarrollador |
| Vista PO | _Pendiente — se documenta en la branch del PO (`docs/po/`)_ |

> Convención para evitar conflictos entre branches: cada vista documenta en su propia carpeta (`docs/developer/`, `docs/po/`). Este README y el C4 de niveles 1–2 son compartidos; el nivel 3 (componentes) se agrega por vista.

## Estructura del proyecto

```
src/
├── api/            # Clientes HTTP por dominio (me, projects, tasks, health) + caché TTL
├── components/
│   ├── Backlog/    # Tablero kanban (compartido Developer/PO vía props scope)
│   ├── Projects/   # Listado de proyectos (compartido vía scope)
│   ├── Sidebar/    # Navegación por rol (DEV_NAV / PO_NAV)
│   ├── dashboard/  # Cards del dashboard de developer
│   └── ui/         # Primitivas shadcn/ui
├── contexts/       # Auth (sesión OCI) y tema (dark mode)
└── pages/
    ├── Developer/  # Vista Developer (esta branch)
    ├── PO/         # Vista Product Owner (branch del PO)
    └── Login/      # Flujo PKCE
```

## Equipo de documentación

Arquitectura C4 y documentación de la vista Developer: **JaviSan, Paco**.
