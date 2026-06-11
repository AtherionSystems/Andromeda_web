# Requerimientos — Vista Product Owner

> **Autores:** JaviSan, Paco · Los requerimientos de la vista Developer se documentan en [`docs/developer/requerimientos.md`](../developer/requerimientos.md).

## Historias de Usuario (HU)

| ID | Historia | Criterios de aceptación |
|---|---|---|
| HU-P1 | Como **Product Owner**, quiero iniciar sesión con mi cuenta corporativa de OCI, para acceder de forma segura sin credenciales adicionales. | Login redirige a OCI IAM (PKCE); al volver, la sesión queda activa y el rol determina la vista PO. |
| HU-P2 | Como **Product Owner**, quiero ver un resumen del estado de todos mis proyectos en el dashboard, para tener visibilidad global de inmediato. | El dashboard carga proyectos, tareas y miembros en paralelo; muestra distribución de tareas por estatus, team distribution y tareas abiertas ordenadas por prioridad. |
| HU-P3 | Como **Product Owner**, quiero crear, editar y eliminar proyectos, para mantener el catálogo de iniciativas actualizado. | Los cambios persisten vía POST/PATCH/DELETE en `/api/projects`; la lista se refresca automáticamente. |
| HU-P4 | Como **Product Owner**, quiero administrar los miembros de cada proyecto, para controlar quién tiene acceso a qué iniciativa. | Puedo agregar y quitar miembros desde la ficha del proyecto; los cambios persisten vía POST/DELETE en `/api/project-members`. |
| HU-P5 | Como **Product Owner**, quiero gestionar los sprints de un proyecto (crear, editar, cambiar estado, eliminar), para planificar las iteraciones del equipo. | Puedo crear sprints, editarlos y cambiar su estado (planned → active → completed); solo puede haber un sprint `active` por proyecto en un momento dado. |
| HU-P6 | Como **Product Owner**, quiero ver y gestionar el backlog completo del equipo, para priorizar y asignar trabajo sin depender de cada developer. | El backlog muestra todas las tareas de todos los proyectos; puedo crear, editar, eliminar tareas y asignarlas a sprints. |
| HU-P7 | Como **Product Owner**, quiero ver las métricas de rendimiento del equipo por proyecto, para identificar tendencias de velocidad y detectar bloqueos. | La sección Analytics muestra Sprint Velocity, Completion Rate, Burndown, Individual Performance, Team Velocity, Task Distribution y Team Task Completion para el proyecto seleccionado. |
| HU-P8 | Como **Product Owner**, quiero saber si el backend está disponible, para distinguir entre "no tengo datos" y "el sistema está caído". | Indicador compacto verde (Operational) / rojo (Unavailable) alimentado por `GET /health`. |

## Requerimientos Funcionales (RF)

| ID | Requerimiento |
|---|---|
| RF-P1 | El sistema debe autenticar al PO mediante OAuth2/PKCE contra OCI IAM y adjuntar el Bearer token a toda llamada a la API. |
| RF-P2 | El dashboard debe cargar proyectos (`GET /api/projects`), tareas por proyecto (`GET /api/projects/{id}/tasks`) y miembros (`GET /api/project-members`) en paralelo con `Promise.allSettled`; el fallo de un proyecto no debe impedir la carga de los demás. |
| RF-P3 | La vista de proyectos debe permitir crear (`POST /api/projects`), editar (`PATCH /api/projects/{id}`) y eliminar (`DELETE /api/projects/{id}`) proyectos. |
| RF-P4 | La gestión de miembros debe permitir agregar (`POST /api/project-members`) y quitar (`DELETE /api/project-members/{id}`) integrantes de un proyecto. |
| RF-P5 | La gestión de sprints debe permitir crear (`POST /api/projects/{id}/sprints`), editar estado (`PATCH /api/projects/{id}/sprints/{sid}`) y eliminar (`DELETE /api/projects/{id}/sprints/{sid}`) sprints. |
| RF-P6 | El backlog en modo PO (`isPOView`) debe mostrar todas las tareas del sistema y permitir crear, editar, eliminar y asignar tareas a sprints. |
| RF-P7 | La sección Analytics debe consumir `GET /api/dashboard?projectId=` y renderizar Sprint Velocity, Completion Rate, Burndown, Individual Performance, Team Velocity, Task Distribution y Team Task Completion. |
| RF-P8 | Las llamadas a la API deben pasar por la capa `src/api/` con caché TTL para deduplicar requests repetidas entre pantallas. |
| RF-P9 | El sistema debe verificar la disponibilidad del backend mediante `GET /health` sin que un fallo del probe cierre la sesión del usuario. |

## Requerimientos No Funcionales (RNF)

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-P1 | Seguridad | Los tokens se obtienen por PKCE (sin client secret expuesto); toda la comunicación con backend e IdP viaja por HTTPS. |
| RNF-P2 | Seguridad / Autorización | Solo usuarios con rol `po` (según `userType` devuelto por OCI IAM) deben poder acceder a la vista PO; cualquier otro rol es redirigido a su vista correspondiente. |
| RNF-P3 | Rendimiento | Las cargas del dashboard se hacen en paralelo (`Promise.allSettled`); las llamadas repetidas entre pantallas se deduplicAN mediante caché TTL en cliente. |
| RNF-P4 | Disponibilidad / Resiliencia | El fallo de un endpoint no debe tumbar la pantalla completa: cada card maneja su propio estado de carga, vacío y error. |
| RNF-P5 | Usabilidad | Toda card debe tener estado de carga (skeleton) y estado vacío con mensaje explicativo. |
| RNF-P6 | Usabilidad | La interfaz debe soportar modo claro y oscuro en todas las pantallas de la vista. |
| RNF-P7 | Compatibilidad | El frontend debe funcionar contra el backend desplegado en OKE vía proxy de desarrollo, sin requerir backend local. |
| RNF-P8 | Mantenibilidad | Los componentes compartidos con la vista Developer (`BacklogPage`, `ProjectsPage`, `Sidebar`) se parametrizan por props/rol; los cambios de la vista PO no deben alterar el comportamiento del Developer. |
