import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./themeContextValue";

function getInitialDarkMode() {
  if (typeof window === "undefined") return false;

  try {
    const stored = window.localStorage.getItem("andromeda_theme");
    if (stored) return stored === "dark";
  } catch {
    // Ignore storage failures and fall back to system preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";

    try {
      window.localStorage.setItem("andromeda_theme", darkMode ? "dark" : "light");
    } catch {
      // Ignore storage failures.
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode: () => setDarkMode((p) => !p), setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

