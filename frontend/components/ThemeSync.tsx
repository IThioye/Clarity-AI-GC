"use client"

import { useEffect } from 'react'
import { useThemeStore } from '../lib/store'

export default function ThemeSync() {
  const theme = useThemeStore((s) => s.theme) // 'dark' | 'light'

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light')
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
  }, [theme])

  return null
}
