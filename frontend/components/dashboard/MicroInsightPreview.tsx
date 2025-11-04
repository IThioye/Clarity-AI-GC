"use client"

import Link from 'next/link'
import { useMemo } from 'react'
import { useJournalStore } from '../../lib/store'

export default function MicroInsightPreview() {
  const journal = useJournalStore((s)=>s.journal)
  const moods = useJournalStore((s)=>s.moods)

  const text = useMemo(()=>{
    const avgMood = moods.length ? Math.round(moods.reduce((a,b)=>a+b.mood,0)/moods.length) : undefined
    if (!avgMood) return 'This week, your reflections leaned toward calm and focus. Keep nurturing your balance.'
    if (avgMood >= 7) return 'This week carried a steady, positive tone. Keep leaning into what restores you.'
    if (avgMood >= 4) return 'A mixed week with steadying moments — your check-ins are building awareness.'
    return 'It looks like a heavier week. Gentle steps and small wins can help lighten the load.'
  }, [moods])

  return (
    <div className="glass-surface p-6 rounded-2xl bg-gradient-to-tr from-[#34D39914] via-transparent to-[#8FC8FF14]">
      <div className="text-sm font-medium mb-1">Micro Insight</div>
      <p className="text-text-secondary text-sm">{text}</p>
      <div className="mt-3">
        <Link href="/insights" className="text-sm underline text-text-secondary hover:text-text-primary">Expand</Link>
      </div>
    </div>
  )
}
