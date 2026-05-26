import { createContext } from "react";

export interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);