// Hook reutilizable que devuelve el ancho actual de la ventana.
// Los componentes lo usan para decidir su layout sin CSS externo.
import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler); // cleanup
  }, []);

  const breakpoint: Breakpoint =
    width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";

  return { width, breakpoint };
}
