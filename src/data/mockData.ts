// ─────────────────────────────────────────────
// DATA — Mock estático de proyectos y navegación
// Reemplazar por llamadas a API (fetch/axios)
// cuando el backend esté disponible.
// ─────────────────────────────────────────────
import type { Project, NavItem } from "../types/project";

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Oracle Java Bot Project",
    description: "Conversational Telegram Oracle Java Bot Integration.",
    status: "active",
    members: [
      { initials: "S", color: "#4db6ac", name: "Sofia M." },
      { initials: "F", color: "#ef7c59", name: "Fernando R." },
      { initials: "M", color: "#5c8fb3", name: "Miguel A." },
    ],
  },
  {
    id: 2,
    title: "MyLearn University UX/UI",
    description: "Improving digital learning experiences on Oracle MyLearn.",
    status: "active",
    members: [
      { initials: "A", color: "#7e6eb5", name: "Ana P." },
      { initials: "J", color: "#4db6ac", name: "Jorge L." },
      { initials: "V", color: "#5c8fb3", name: "Valeria C." },
    ],
  },
];

// Rutas del sidebar — los iconos se inyectan en Sidebar.tsx
export const NAV_ROUTES: Omit<NavItem, "icon">[] = [
  { label: "Dashboard", route: "/" },
  { label: "Projects", route: "/projects" },
  { label: "Backlog", route: "/backlog" },
  { label: "Analytics", route: "/analytics" },
  { label: "Team", route: "/team" },
  { label: "Settings", route: "/settings" },
];
