import React, { useEffect, useState } from 'react'

import { Button } from './Button'

const THEME_KEY = 'theme'

type Theme = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'system'
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme())

  // Apply theme to <html> element
  useEffect(() => {
    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        localStorage.removeItem(THEME_KEY)
        const sys = getSystemTheme()
        document.documentElement.classList.toggle('dark', sys === 'dark')
      } else {
        localStorage.setItem(THEME_KEY, t)
        document.documentElement.classList.toggle('dark', t === 'dark')
      }
    }
    applyTheme(theme)
    if (theme === 'system') {
      const listener = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      mql.addEventListener('change', listener)
      return () => mql.removeEventListener('change', listener)
    }
  }, [theme])

  const nextTheme = () => {
    if (theme === 'light') return setTheme('dark')
    if (theme === 'dark') return setTheme('system')
    setTheme('light')
  }

  return (
    <Button
      onClick={nextTheme}
      className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 dark:border-gray-600 bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 transition"
      title="Toggle theme"
    >
      {theme === 'light' && (
        <span aria-label="Light mode" title="Light mode">
          🌞 Light
        </span>
      )}
      {theme === 'dark' && (
        <span aria-label="Dark mode" title="Dark mode">
          🌚 Dark
        </span>
      )}
      {theme === 'system' && (
        <span aria-label="System" title="System">
          💻 System
        </span>
      )}
    </Button>
  )
}

export default ThemeToggle
