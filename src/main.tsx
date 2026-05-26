import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/themeContext'

const storedTheme = window.localStorage.getItem('andromeda_theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialDarkMode = storedTheme ? storedTheme === 'dark' : prefersDark

document.documentElement.classList.toggle('dark', initialDarkMode)
document.documentElement.style.colorScheme = initialDarkMode ? 'dark' : 'light'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
