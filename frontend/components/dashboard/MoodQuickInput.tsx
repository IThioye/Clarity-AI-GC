'use client'

import Link from 'next/link'
import { useJournalStore } from '../../lib/store'
import { useEffect, useMemo, useState } from 'react'

function moodToEmoji(v: number | undefined) {
  const n = v ?? 6
  if (n <= 2) return '😔'
  if (n <= 4) return '🙁'
  if (n <= 6) return '😐'
  if (n <= 8) return '🙂'
  return '😄'
}

export default function MoodQuickInput() {
  const addMood = useJournalStore((s) => s.addMood)
  const todaysMood = useJournalStore((s) => {
    const today = new Date().toISOString().slice(0,10)
    return s.moods.find((m)=>m.date===today)?.mood
  })

  // To prevent hydration mismatches, start with a stable default, then sync from store after mount
  const [local, setLocal] = useState<number>(6)
  useEffect(()=>{
    if (typeof todaysMood === 'number') setLocal(todaysMood)
  }, [todaysMood])

  const displayValue = local
  const displayEmoji = useMemo(()=> moodToEmoji(displayValue), [displayValue])

  function onChange(val: number) {
    setLocal(val)
    addMood(val)
  }

  return (
    <div className="glass-surface p-6 rounded-2xl bg-gradient-to-tr from-[#8FC8FF14] to-[#C58AFF14]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">Today’s mood</div>
          <div className="text-xs text-text-secondary">Slide to set how you feel right now</div>
        </div>
        <Link href="/journal" className="neon-edge px-3 py-1.5 rounded-lg text-sm hover:scale-[1.02] transition">Write a new entry ✍️</Link>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          aria-label="Mood slider"
          value={displayValue}
          onChange={(e)=> onChange(parseInt(e.target.value))}
          onInput={(e)=> onChange(parseInt((e.target as HTMLInputElement).value))}
          className="w-full mt-2 h-2 rounded-full appearance-none"
          style={{ background: 'linear-gradient(90deg, #8FC8FF 0%, #A78BFA 100%)' }}
        />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-text-secondary">
        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-text-primary">{displayValue ? `${displayValue}/10` : '—/10'}</span>
        <span aria-hidden>{displayEmoji}</span>
        <span>Now</span>
      </div>
    </div>
  )
}
