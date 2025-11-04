"use client"

import { useEffect } from 'react'
import { useThemeStore } from '../lib/store'

const STORAGE_KEY = 'clarity-theme'

export default function ThemeSync() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored)
        return
      }
    } catch {}

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
    // we intentionally exclude setTheme from deps to avoid looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.remove('theme-dark', 'theme-light')
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  return null
}
