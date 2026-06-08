import { createContext } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);