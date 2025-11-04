"use client"

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { useOnboardingStore, useJournalStore, usePlanStore } from '../../lib/store'
import { ArrowRightCircle, BarChart3, Target, Sparkles, Settings, CalendarCheck, Pencil } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

function formatMemberSince(journalTimes: string[]) {
  if (!journalTimes.length) return undefined
  const earliest = new Date(Math.min(...journalTimes.map((t) => new Date(t).getTime())))
  return earliest.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function calcStreak(journalTimes: string[]) {
  if (!journalTimes.length) return 0
  const days = new Set(journalTimes.map((t) => new Date(t).toISOString().slice(0, 10)))
  let streak = 0
  let d = new Date()
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak += 1
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function ProfilePage() {
  const identity = useOnboardingStore((s) => s.identity)
  const update = useOnboardingStore((s) => s.update)
  const name = identity.name || ''
  const firstName = (identity.nickname || name.split(' ')[0] || 'Friend')
  const displayGreetingName = identity.nickname || (name.split(' ')[0] || 'Friend')
  const journal = useJournalStore((s) => s.journal)
  const focus = usePlanStore((s) => s.focus)

  const initials = useMemo(() => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(), [name])
  const entryTimes = useMemo(() => journal.map((j) => j.created_at), [journal])
  const memberSince = useMemo(() => formatMemberSince(entryTimes), [entryTimes])
  const streak = useMemo(() => calcStreak(entryTimes), [entryTimes])

  const entriesCount = journal.length
  const entryLimit = 50
  const progressPct = Math.min(100, Math.round((entriesCount / entryLimit) * 100))
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)

  function onAvatarChange(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        update({ identity: { ...identity, avatarUrl: String(reader.result) } as any })
      } catch {}
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-[980px] mx-auto space-y-8">
      {/* Hero */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text-secondary">Profile</div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Hi, {displayGreetingName} 👋</h1>
            <div className="text-sm text-text-secondary mt-1">{memberSince ? `Member since ${memberSince}` : 'Member since —'}</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="space-y-1">
                <span className="text-sm text-text-secondary">First name</span>
                <input defaultValue={name.split(' ')[0] || ''} placeholder="First name" onBlur={(e)=> { const parts = (identity.name||'').split(' '); parts[0] = e.target.value; update({ identity: { ...identity, name: parts.filter(Boolean).join(' ') } as any }) }} className="bg-transparent border-b border-white/15 focus:border-white/30 px-0 py-1 outline-none text-sm w-full" />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-text-secondary">Last name</span>
                <input defaultValue={name.split(' ').slice(1).join(' ')} placeholder="Last name" onBlur={(e)=> { const first = (identity.name||'').split(' ')[0]||''; update({ identity: { ...identity, name: [first, e.target.value].filter(Boolean).join(' ') } as any }) }} className="bg-transparent border-b border-white/15 focus:border-white/30 px-0 py-1 outline-none text-sm w-full" />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-text-secondary">Nickname (optional)</span>
                <input defaultValue={identity.nickname || ''} placeholder="Nickname" onBlur={(e)=> update({ identity: { ...identity, nickname: e.target.value } as any })} className="bg-transparent border-b border-white/15 focus:border-white/30 px-0 py-1 outline-none text-sm w-full" />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-text-secondary">Birthdate</span>
                <input type="date" defaultValue={identity.dateOfBirth || ''} onChange={(e)=> update({ identity: { ...identity, dateOfBirth: e.target.value } as any })} className="bg-transparent border-b border-white/15 focus:border-white/30 px-0 py-1 outline-none text-sm w-full" />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-text-secondary">Email</span>
                <input value={(identity as any).email || 'you@example.com'} readOnly className="bg-transparent border-b border-white/10 px-0 py-1 outline-none text-sm w-full opacity-70" />
              </label>
            </div>
          </div>
          <div className="shrink-0">
            <div className="relative h-16 w-16 rounded-full overflow-hidden"
                 style={{ background: 'conic-gradient(from 220deg, rgba(197,138,255,0.25), rgba(143,200,255,0.25))' }}>
              <div className="h-full w-full rounded-full grid place-items-center bg-black/30 border border-white/15">
                {identity?.avatarUrl ? (
                  <img src={identity.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-semibold">{initials}</span>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=> onAvatarChange(e.target.files?.[0] || undefined)} />
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-black/30 grid place-items-center"
                onMouseLeave={()=> setAvatarMenuOpen(false)}
              >
                {!avatarMenuOpen ? (
                  <button onClick={()=> setAvatarMenuOpen(true)} className="glass px-2 py-1 rounded-lg inline-flex items-center gap-1 text-xs"><Pencil className="h-3 w-3" /> Edit</button>
                ) : (
                  <div className="glass rounded-lg p-2 text-xs grid gap-1">
                    <button className="px-2 py-1 text-left hover:bg-white/5 rounded" onClick={()=> { setAvatarMenuOpen(false); fileRef.current?.click() }}>Upload</button>
                    {identity?.avatarUrl && (
                      <button className="px-2 py-1 text-left hover:bg-white/5 rounded" onClick={()=> { update({ identity: { ...identity, avatarUrl: undefined } as any }); setAvatarMenuOpen(false) }}>Remove</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-text-secondary">Entries</div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span>{entriesCount} / {entryLimit}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white/60" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-text-secondary">Streak</div>
          <div className="mt-1 text-lg font-semibold">{streak} {streak === 1 ? 'day' : 'days'}</div>
          <div className="mt-1 text-xs opacity-80">Keep it going — small wins compound.</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-text-secondary">This week</div>
          <div className="mt-1 text-sm">You’ve been feeling calmer 🌿</div>
          <div className="mt-2 text-xs opacity-80">We’ll surface gentle nudges here.</div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="font-medium">Your Focus Areas</div>
          <Link href="/plan" className="text-sm opacity-90 hover:opacity-100">+ Add Focus</Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {focus.length === 0 ? (
            <div className="text-sm text-text-secondary">No focus areas yet. Add a couple on the Plan tab.</div>
          ) : (
            focus.slice(0, 3).map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-sm glass">{f}</span>
            ))
          )}
        </div>
      </section>

      

      {/* Quick Actions */}
      <section className="grid sm:grid-cols-4 gap-3">
        <Link href="/insights" className="glass rounded-xl p-4 inline-flex items-center gap-2 text-sm hover:scale-[1.01] transition">
          <BarChart3 className="h-4 w-4" /> View Insights
        </Link>
        <Link href="/plan" className="glass rounded-xl p-4 inline-flex items-center gap-2 text-sm hover:scale-[1.01] transition">
          <Target className="h-4 w-4" /> View Plan
        </Link>
        <Link href="/pricing" className="glass rounded-xl p-4 inline-flex items-center gap-2 text-sm hover:scale-[1.01] transition">
          <Sparkles className="h-4 w-4" /> Manage Plan
        </Link>
        <Link href="/settings" className="glass rounded-xl p-4 inline-flex items-center gap-2 text-sm hover:scale-[1.01] transition">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </section>

      {/* Upgrade Banner */}
      <section className="glass rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-sm">Upgrade to <span className="bg-gradient-to-r from-[#C58AFF] via-[#B596FF] to-[#8FC8FF] bg-clip-text text-transparent font-semibold">Clarity+</span></div>
          <div className="text-sm opacity-80">Unlock unlimited entries and deeper insights tailored to you</div>
        </div>
        <Link href="/pricing" className="neon-edge px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm">
          Upgrade <ArrowRightCircle className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-xs text-text-secondary flex items-center justify-between">
        <span>Your data is encrypted. Even we can’t read it.</span>
        <span className="inline-flex items-center gap-2"><CalendarCheck className="h-3.5 w-3.5" /> v0.1.0 • Made with ❤️ by the AIV5</span>
      </footer>
    </div>
  )
}
