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
    <Button variant="primary" round title="Toggle theme" onClick={nextTheme}>
      {theme === 'light' && (
        <span aria-label="Light mode" title="Light mode">
          🌞
        </span>
      )}

      {theme === 'dark' && (
        <span aria-label="Dark mode" title="Dark mode">
          🌚
        </span>
      )}

      {theme === 'system' && (
        <span aria-label="System" title="System">
          💻
        </span>
      )}
    </Button>
  )
}

export default ThemeToggle
