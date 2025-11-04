'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useOnboardingStore, useThemeStore } from '../lib/store'
import type { Route } from 'next'

export function Navbar() {
  const identity = useOnboardingStore((s) => s.identity)
  const name = identity.name || identity.nickname || 'Friend'
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const initials = (name || 'You')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const serverFallbackInitials = 'F'
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (!open) return
      if (menuRef.current && !menuRef.current.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 transition-colors duration-300 ${scrolled ? 'backdrop-blur-xl' : 'backdrop-blur-sm'} bg-transparent`}>
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/brand/logo.png" alt="Clarity AI" className="w-9 h-9" />
          <span className="font-semibold tracking-wide">Clarity AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/dashboard" className="hover:text-text-primary">Dashboard</Link>
            <Link href="/journal" className="hover:text-text-primary">Journal</Link>
            <Link href="/archive" className="hover:text-text-primary">Archive</Link>
            <Link href="/insights" className="hover:text-text-primary">Insights</Link>
            <Link href="/plan" className="hover:text-text-primary">Plan</Link>
          </nav>

          <Link href={("/pricing" as Route)} className="hidden sm:inline-flex neon-edge px-3 py-1.5 rounded-lg text-sm">Pricing</Link>

          <div className="relative">
            <button
              aria-label="Account menu"
              onClick={() => setOpen((v) => !v)}
              ref={btnRef}
              aria-haspopup="menu"
              aria-expanded={open}
              className="glass h-9 w-9 rounded-full overflow-hidden grid place-items-center text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              {mounted && identity?.avatarUrl ? (
                <img src={identity.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{mounted ? initials : serverFallbackInitials}</span>
              )}
            </button>
            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Account"
                className={`z-50 absolute right-0 mt-2 w-72 rounded-xl p-3 shadow-lg backdrop-blur-xl ${theme==='dark' ? 'bg-black/60 border border-white/10' : 'bg-white/80 border border-black/10'}`}
              >
                <div className="px-2 py-2">
                  <div className="text-xs text-text-secondary">Signed in as</div>
                  <div className="text-sm font-medium mt-0.5">{name || 'Guest'}</div>
                </div>
                <div className="my-2 h-px bg-white/10" />
                <div className="grid gap-1 text-sm">
                  <Link href={("/profile" as Route)} role="menuitem" className={`px-2 py-2 rounded-lg ${theme==='dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>Profile</Link>
                  <Link href="/settings" role="menuitem" className={`px-2 py-2 rounded-lg ${theme==='dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>Settings</Link>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    role="menuitem"
                    className={`px-2 py-2 rounded-lg text-left ${theme==='dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                  >
                    Theme: {theme === 'dark' ? 'Dark' : 'Light'}
                  </button>
                  <Link href={("/pricing" as Route)} role="menuitem" className={`px-2 py-2 rounded-lg ${theme==='dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>Pricing & Upgrade</Link>
                  <a href="https://forms.gle/" target="_blank" role="menuitem" className={`px-2 py-2 rounded-lg ${theme==='dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>Help & Feedback</a>
                  <Link href={("/about" as Route)} role="menuitem" className={`px-2 py-2 rounded-lg ${theme==='dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>About</Link>
                </div>
                <div className="my-2 h-px bg-white/10" />
                <button className="w-full px-2 py-2 rounded-lg hover:bg-white/5 text-left text-sm" role="menuitem">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
