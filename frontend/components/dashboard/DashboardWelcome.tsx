"use client"

import { useEffect, useMemo, useState } from 'react'
import { useOnboardingStore } from '../../lib/store'

export default function DashboardWelcome() {
  const storeName = useOnboardingStore((s) => s.identity.name || s.identity.nickname || '')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const name = mounted && storeName ? storeName : 'Friend'

  const greeting = useMemo(() => {
    if (!mounted) return 'Welcome'
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [mounted])

  const subcopy = useMemo(() => {
    if (!mounted) return 'A gentle space for reflection.'
    const h = new Date().getHours()
    if (h < 12) return 'Ready to reflect?'
    if (h < 18) return 'Your mind deserves a moment today.'
    return 'Let’s close the day gently.'
  }, [mounted])

  return (
    <div className="glass-surface p-6 rounded-2xl bg-gradient-to-r from-[#8FC8FF0f] via-transparent to-[#A78BFA0f]">
      <div className="text-sm text-text-secondary">{greeting}, {name} <span aria-hidden>👋</span></div>
      <h1 className="text-2xl font-semibold mt-1">Your daily hub</h1>
      <p className="text-sm text-text-secondary mt-1">{subcopy}</p>
    </div>
  )
}
