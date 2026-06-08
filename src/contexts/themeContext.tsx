import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeMode } from "./themeContextValue";

const THEME_STORAGE_KEY = "andromeda_theme";

function getSystemDarkMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(stored)) return stored;
  } catch {
    // Ignore storage failures and fall back to system preference.
  }

  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemDarkMode, setSystemDarkMode] = useState(getSystemDarkMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDarkMode(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const darkMode = themeMode === "system" ? systemDarkMode : themeMode === "dark";

  function applyThemeMode(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // Ignore storage failures.
    }
  }, [darkMode, themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        themeMode,
        setThemeMode: applyThemeMode,
        toggleDarkMode: () => applyThemeMode(darkMode ? "light" : "dark"),
        setDarkMode: (nextDarkMode: boolean) => applyThemeMode(nextDarkMode ? "dark" : "light"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

