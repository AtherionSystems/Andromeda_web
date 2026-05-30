/** Miembro del equipo asignado a un proyecto */
export interface Member {
  initials: string; // Máximo 2 letras, ej: "SJ"
  color: string; // Color hex para el avatar circular
  name: string; // Nombre completo (tooltip)
}

/** Proyecto activo en el dashboard */
export interface Project {
  id: number;
  title: string;
  description: string;
  members: Member[];
  coverImage?: string; // URL de imagen; si no existe, se usa SVG placeholder
  status: "active" | "paused" | "done";
}

/** Ítem de navegación del Sidebar */
export interface NavItem {
  label: string;
  route: string;
  icon: React.ReactNode;
}

/** Tab de la Topbar */
export interface TopbarTab {
  label: string;
  value: string;
}
