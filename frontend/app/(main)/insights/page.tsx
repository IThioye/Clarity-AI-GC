'use client'

import dynamic from 'next/dynamic'
import { moodSeries, keywords } from '../../../lib/mock-data'
import UpsellBanner from '../../../components/dashboard/UpsellBanner'
import Link from 'next/link'
import { useMemo } from 'react'
import { useJournalStore } from '../../../lib/store'

const MoodChart = dynamic(() => import('../../../components/charts/MoodChart'), { ssr: false })

export default function InsightsPage() {
  const locked = true
  const journal = useJournalStore((s)=>s.journal)
  const freq = useMemo(()=>{
    // build last 14 days frequency; fallback mock wave if empty
    const out: { label:string; count:number }[] = []
    const now = new Date()
    for (let i=13;i>=0;i--) {
      const d = new Date(now)
      d.setDate(now.getDate()-i)
      const key = d.toISOString().slice(0,10)
      const label = d.toLocaleDateString(undefined,{ day:'2-digit' })
      const count = journal.filter(j=>j.created_at.slice(0,10)===key).length
      out.push({ label, count })
    }
    if (journal.length===0) {
      // soft mock (0-3) to keep the chart alive
      out.forEach((b, idx)=>{ b.count = Math.max(0, Math.round(1.2 + Math.sin(idx/2)*1.2)) })
    }
    return out
  }, [journal])
  return (
    <div className="space-y-8">
      <section className="glass-surface p-6">
        <h2 className="text-xl mb-2">AI Summary</h2>
        <p className="text-text-secondary">You maintained a steady mood with reflective spikes around mid-week. Keywords suggest focus on planning and gratitude.</p>
      </section>

      <section>
        <UpsellBanner />
      </section>

      <section className="relative">
        {/* Locked content container */}
        <div className={`grid grid-cols-12 gap-6 ${locked ? 'filter blur-sm pointer-events-none select-none' : ''}`} aria-hidden={locked}>
          <div className="col-span-8 glass-surface p-6">
            <h3 className="mb-3">Mood over time</h3>
            <MoodChart data={moodSeries} stroke="#C58AFF" />
          </div>
          <div className="col-span-4 glass-surface p-6">
            <h3 className="mb-3">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <span key={k} className="px-3 py-1 rounded-full border border-white/15 text-sm text-text-secondary">{k}</span>
              ))}
            </div>
          </div>

          {/* Theme Highlights (pills) */}
          <div className="col-span-12 glass-surface p-6">
            <h3 className="mb-3">Theme Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {(keywords.slice(0,5).length?keywords.slice(0,5):['gratitude','focus','stress','growth','balance']).map((w,i)=> (
                <span key={w}
                  className={`px-3 py-1 rounded-full border border-white/15 text-sm ${i%2===0?'animate-pulse':''}`}
                  style={{ animationDuration: '2.5s', animationIterationCount:'infinite', animationTimingFunction:'ease-in-out', opacity: 0.9 }}
                >{w}</span>
              ))}
            </div>
          </div>

          {/* Emotional Pattern Insight */}
          <div className="col-span-12 glass-surface p-6">
            <div className="flex items-center gap-2 mb-2"><span aria-hidden>✨</span><h3>Emotional Pattern Insight</h3></div>
            <div className="border-t border-white/10 my-2"></div>
            <p className="text-text-secondary">You mention ‘progress’ and ‘confidence’ more often on weekdays — weekends show more rest and reset.</p>
          </div>

          {/* Journaling Frequency (14 days) */}
          <div className="col-span-12 glass-surface p-6">
            <h3 className="mb-3">Journaling Frequency (14 days)</h3>
            <div className="h-28 w-full relative">
              <svg className="absolute inset-0 w-full h-full">
                {freq.map((b, i)=>{
                  const w = 100/freq.length
                  const x = i*w
                  const h = (b.count/3)*100
                  const y = 100 - h
                  return (
                    <g key={i}>
                      <rect x={`${x+2}%`} y={`${y}%`} width={`${w-4}%`} height={`${h}%`} rx="3" fill="#8FC8FF" opacity={0.7} />
                      <title>{`${b.label}: ${b.count}`}</title>
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="mt-2 text-xs text-text-secondary">Consistency builds clarity — just one reflection a day helps your mind reset.</div>
          </div>

          {/* Reflection Prompt CTA */}
          <div className="col-span-12 glass-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">Reflection Prompt</h3>
                <div className="text-text-secondary">Want to explore how you’ve grown this month?</div>
              </div>
              <Link href="/journal" className="neon-edge px-3 py-2 rounded-lg text-sm hover:scale-[1.02] transition">Open guided entry →</Link>
            </div>
          </div>
        </div>
        {/* Overlay CTA */}
        {locked && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="glass-surface px-5 py-4 rounded-xl border border-white/15 bg-black/40 text-center max-w-md">
              <div className="text-sm mb-1">Clarity+ required</div>
              <div className="text-lg font-semibold">Unlock deeper insights</div>
              <div className="text-sm text-text-secondary mt-1">Adaptive summaries, richer patterns, and gentle nudges.</div>
              <div className="mt-3">
                <Link href="/pricing" className="neon-edge px-3 py-2 rounded-lg inline-flex items-center gap-2 text-sm hover:scale-[1.02] transition">Upgrade →</Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
