'use client'

import { useEffect, useMemo, useState } from 'react'
import { useThemeStore, useOnboardingStore, useJournalStore, type OnboardingState } from '../../../lib/store'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'

function downloadJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const { identity, space, experience, goals, inner, update, reset: resetOnboarding } = useOnboardingStore()
  const { journal, moods, chat, clearJournal, clearChat } = useJournalStore()

  const [e2ee, setE2ee] = useState<boolean>(true)
  const [themeMode, setThemeMode] = useState<'dark'|'light'|'auto'>(theme)
  const [journalLayout, setJournalLayout] = useState<'minimal'|'guided'>('minimal')
  const [fontSize, setFontSize] = useState<'sm'|'md'|'lg'>('md')
  const [moodStyle, setMoodStyle] = useState<'emoji'|'slider'|'tags'>('emoji')
  const [name, setName] = useState(identity.name || '')
  const [nickname, setNickname] = useState(identity.nickname || '')
  const [dob, setDob] = useState(identity.dateOfBirth || '')
  const [favAnimal, setFavAnimal] = useState(identity.favoriteAnimal || '')
  const [email] = useState('you@example.com')
  const [notifDaily, setNotifDaily] = useState(false)
  const [notifWeekly, setNotifWeekly] = useState(false)
  const [notifStreak, setNotifStreak] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('settings_e2ee')
      if (raw) setE2ee(JSON.parse(raw))
      setJournalLayout((localStorage.getItem('pref_journal_layout') as any) || 'minimal')
      setFontSize((localStorage.getItem('pref_font_size') as any) || 'md')
      setMoodStyle((localStorage.getItem('pref_mood_style') as any) || 'emoji')
      setNotifDaily(JSON.parse(localStorage.getItem('notif_daily_reflection')||'false'))
      setNotifWeekly(JSON.parse(localStorage.getItem('notif_weekly_summary')||'false'))
      setNotifStreak(JSON.parse(localStorage.getItem('notif_streak_alerts')||'false'))
    } catch {}
  }, [])

  useEffect(() => {
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      try { localStorage.setItem('pref_theme_mode','auto') } catch {}
    } else {
      setTheme(themeMode)
      try { localStorage.setItem('pref_theme_mode', themeMode) } catch {}
    }
  }, [themeMode, setTheme])

  function saveProfile() {
    update({ identity: { ...identity, name, nickname, dateOfBirth: dob, favoriteAnimal: favAnimal } as any })
  }

  function savePrivacy() {
    try { localStorage.setItem('settings_e2ee', JSON.stringify(e2ee)) } catch {}
    alert('Privacy settings saved')
  }

  const exportPayload = useMemo(() => ({
    theme,
    settings: { e2ee },
    onboarding: { identity, space, experience, goals, inner } as Partial<OnboardingState>,
    data: { journal, moods, chat },
    version: 1,
    exportedAt: new Date().toISOString(),
  }), [theme, e2ee, identity, space, experience, goals, inner, journal, moods, chat])

  function exportAll() {
    downloadJson('clarity-backup.json', exportPayload)
  }

  function importAll(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (parsed?.onboarding) update(parsed.onboarding)
        if (parsed?.settings?.e2ee !== undefined) setE2ee(!!parsed.settings.e2ee)
        if (parsed?.theme === 'dark' || parsed?.theme === 'light') setTheme(parsed.theme)
        alert('Import complete')
      } catch {
        alert('Failed to import file')
      }
    }
    reader.readAsText(file)
  }

  function clearAllData() {
    if (!confirm('This will clear onboarding, journal, chat, and mood data on this device. Continue?')) return
    resetOnboarding()
    clearJournal()
    clearChat()
    try { localStorage.removeItem('clarity_moods_v1') } catch {}
    alert('All local data cleared.')
  }

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Make Clarity feel like yours.</p>
      </header>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">Appearance</h2>
        <div className="flex gap-2">
          {(['dark','light','auto'] as const).map(v => (
            <button key={v} className={`px-3 py-1.5 rounded-lg border ${themeMode===v?'glass neon-edge':'border-white/15 bg-white/5'}`} onClick={()=>setThemeMode(v)}>{v === 'dark' ? 'Dark' : v === 'light' ? 'Light' : 'Auto'}</button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">Journal</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm text-text-secondary mb-1">Layout</div>
            {(['minimal','guided'] as const).map(v => (
              <button key={v} className={`mr-2 mb-2 px-3 py-1.5 rounded-lg border ${journalLayout===v?'glass neon-edge':'border-white/15 bg-white/5'}`} onClick={()=>{ setJournalLayout(v); try{ localStorage.setItem('pref_journal_layout', v) }catch{} }}>{v === 'minimal' ? 'Minimal' : 'Guided'}</button>
            ))}
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Font size</div>
            {(['sm','md','lg'] as const).map(v => (
              <button key={v} className={`mr-2 mb-2 px-3 py-1.5 rounded-lg border ${fontSize===v?'glass neon-edge':'border-white/15 bg-white/5'}`} onClick={()=>{ setFontSize(v); try{ localStorage.setItem('pref_font_size', v) }catch{} }}>{v === 'sm' ? 'Small' : v === 'md' ? 'Medium' : 'Large'}</button>
            ))}
          </div>
          <div className="sm:col-span-2">
            <div className="text-sm text-text-secondary mb-1">Mood input</div>
            {(['emoji','slider','tags'] as const).map(v => (
              <button key={v} className={`mr-2 mb-2 px-3 py-1.5 rounded-lg border ${moodStyle===v?'glass neon-edge':'border-white/15 bg-white/5'}`} onClick={()=>{ setMoodStyle(v); try{ localStorage.setItem('pref_mood_style', v) }catch{} }}>{v === 'emoji' ? 'Emoji' : v === 'slider' ? 'Slider' : 'Tags'}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">Security</h2>
        <div className="text-sm text-text-secondary">Reset your password. We’ll send a reset link to your email.</div>
        <div className="flex gap-2">
          <Button className="bg-white/10" onClick={()=> alert('Password reset link sent to your email (mock).')}>Reset Password</Button>
        </div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">Notifications</h2>
        <div className="grid gap-2">
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" onChange={(e)=>{ try { localStorage.setItem('notif_daily_reflection', JSON.stringify(e.target.checked)) } catch {} }} checked={notifDaily} /> Daily reflection</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" onChange={(e)=>{ try { localStorage.setItem('notif_weekly_summary', JSON.stringify(e.target.checked)) } catch {} }} checked={notifWeekly} /> Weekly summary</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" onChange={(e)=>{ try { localStorage.setItem('notif_streak_alerts', JSON.stringify(e.target.checked)) } catch {} }} checked={notifStreak} /> Streak alerts</label>
        </div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">Privacy & Security</h2>
        <div className="text-sm glass rounded-lg px-3 py-2 inline-flex">End‑to‑End Encryption: Enabled 🔒</div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-white/10" onClick={savePrivacy}>Save privacy</Button>
          <Button onClick={exportAll}>Export backup</Button>
          <label className="px-4 py-2 rounded-lg border border-white/15 cursor-pointer">Import backup<input type="file" accept="application/json" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importAll(f) }} /></label>
          <Button className="bg-white/5 border border-white/15" onClick={()=>{ if(confirm('Reset encryption key? You will lose access to previously exported data. Continue?')) alert('Key reset (mock).') }}>Reset key</Button>
          <Button className="bg-white/5 border border-white/15" onClick={clearAllData}>Clear all data</Button>
        </div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">Subscription</h2>
        <a href="/pricing" className="neon-edge px-3 py-2 rounded-lg inline-flex items-center gap-2 text-sm w-max">Manage subscription</a>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium">About</h2>
        <div className="text-sm text-text-secondary">Version v0.1.0 • Terms • Privacy • Acknowledgements</div>
      </section>

      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-medium text-rose-200">Danger Zone</h2>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-white/5 border border-white/15" onClick={()=>resetOnboarding()}>Reset onboarding</Button>
          <Button className="bg-white/5 border border-white/15" onClick={()=>{ if(confirm('This will permanently erase all encrypted data on this device. Continue?')) { clearAllData() } }}>Delete account</Button>
        </div>
      </section>
    </div>
  )
}
