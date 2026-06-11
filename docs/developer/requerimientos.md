# Requerimientos — Vista Developer

> **Autores:** JaviSan, Paco · Branch: `DeveloperView` · Los requerimientos de la vista PO se documentan en `docs/po/`.

## Historias de Usuario (HU)

| ID | Historia | Criterios de aceptación |
|---|---|---|
| HU-D1 | Como **developer**, quiero iniciar sesión con mi cuenta corporativa de OCI, para acceder de forma segura sin credenciales adicionales. | Login redirige a OCI IAM (PKCE); al volver, la sesión queda activa y el rol determina la vista. |
| HU-D2 | Como **developer**, quiero ver la distribución de mis tareas por estatus, para saber de un vistazo cuánto tengo pendiente, en curso y terminado. | La card muestra conteos por estatus del proyecto seleccionado; tolera variaciones de formato del backend (mayúsculas, camelCase). |
| HU-D3 | Como **developer**, quiero comparar mis horas estimadas contra las reales por sprint, para saber si estoy sub o sobre-estimando. | Barras agrupadas Estimated vs Actual desde cero (sin valores negativos); el tooltip muestra la desviación en horas y %; el encabezado muestra drift promedio y tendencia. |
| HU-D4 | Como **developer**, quiero ver cuántas tareas completé en cada sprint, para conocer mi velocidad personal. | La card lista los sprints del proyecto seleccionado con su conteo de tareas completadas. |
| HU-D5 | Como **developer**, quiero ver mis tareas abiertas ordenadas por prioridad, para decidir qué atacar primero. | "Upcoming" excluye tareas done y ordena critical → high → medium → low. |
| HU-D6 | Como **developer**, quiero ver el avance del sprint activo de mi equipo, para tener contexto de cómo vamos como equipo. | La card muestra proyecto, nombre del sprint y % de tareas done; si no hay sprint activo muestra el último completado con etiqueta "Last sprint". |
| HU-D7 | Como **developer**, quiero ver únicamente los proyectos donde soy miembro, para no mezclarme con iniciativas ajenas. | Projects usa `/api/me/projects` en modo solo lectura; el selector del dashboard se llena con la misma fuente. |
| HU-D8 | Como **developer**, quiero gestionar mis tareas en un tablero kanban y cambiar su estatus, para reflejar mi avance sin depender del PO. | El backlog muestra solo tareas propias; arrastrar/cambiar estatus persiste vía API con rollback si falla. |
| HU-D9 | Como **developer**, quiero saber si el backend está disponible, para distinguir entre "no tengo datos" y "el sistema está caído". | Indicador compacto verde (Operational) / rojo (Unavailable) alimentado por `GET /health`. |

## Requerimientos Funcionales (RF)

| ID | Requerimiento |
|---|---|
| RF-D1 | El sistema debe autenticar al developer mediante OAuth2/PKCE contra OCI IAM y adjuntar el Bearer token a toda llamada a la API. |
| RF-D2 | El dashboard debe consumir `GET /api/me/dashboard?projectId=` y renderizar distribución de tareas, horas por sprint y tareas completadas por sprint del usuario autenticado. |
| RF-D3 | El selector de proyecto del dashboard debe poblarse dinámicamente con `GET /api/me/projects` (sin proyectos hardcodeados) y refrescar las cards al cambiar la selección. |
| RF-D4 | La card de progreso de sprint debe identificar el sprint con estatus `active` por proyecto; en su ausencia, usar el último sprint `completed` (ordenado por `actualEnd`/`dueDate`) e indicarlo visualmente. |
| RF-D5 | El backlog debe permitir al developer cambiar el estatus de sus tareas (`todo`, `in_progress`, `review`, `done`) vía `PATCH /api/projects/{id}/tasks/{taskId}`, con actualización optimista y rollback ante error. |
| RF-D6 | El cliente debe descartar tareas asignadas al usuario cuyo proyecto no figure en su membresía (consistencia ante asignaciones huérfanas en BD). |
| RF-D7 | Las llamadas a la API deben pasar por la capa `src/api/` con caché TTL para deduplicar requests repetidas entre pantallas. |
| RF-D8 | La vista debe normalizar los valores de estatus recibidos del backend (mayúsculas, guiones, camelCase) antes de clasificarlos. |
| RF-D9 | El sistema debe verificar la disponibilidad del backend mediante `GET /health` sin que un fallo de autenticación en el probe cierre la sesión del usuario. |

## Requerimientos No Funcionales (RNF)

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-D1 | Seguridad | Los tokens se obtienen por PKCE (sin client secret expuesto en el flujo); toda la comunicación con backend e IdP viaja por HTTPS. |
| RNF-D2 | Seguridad / Privacidad | La vista Developer no debe exponer datos individuales de otros usuarios; los únicos datos de equipo permitidos son agregados (conteo done/total del sprint). |
| RNF-D3 | Rendimiento | Las pantallas deben deduplicar llamadas repetidas mediante caché TTL en cliente; las cargas independientes se hacen en paralelo (`Promise.allSettled`). |
| RNF-D4 | Disponibilidad / Resiliencia | El fallo de un endpoint no debe tumbar la pantalla completa: cada card maneja su propio estado de carga, vacío y error. |
| RNF-D5 | Usabilidad | Toda card debe tener estado de carga (skeleton) y estado vacío con mensaje explicativo; las gráficas no deben mostrar valores contraintuitivos (p. ej. horas negativas). |
| RNF-D6 | Usabilidad | La interfaz debe soportar modo claro y oscuro en todas las pantallas de la vista. |
| RNF-D7 | Compatibilidad | El frontend debe funcionar contra el backend desplegado en OKE vía proxy de desarrollo, sin requerir backend local. |
| RNF-D8 | Mantenibilidad | Los componentes compartidos con la vista PO (`BacklogPage`, `ProjectsPage`, `Sidebar`) se parametrizan por props/rol; los cambios de la vista Developer no deben alterar el comportamiento de PO. |
