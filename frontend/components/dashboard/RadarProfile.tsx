"use client"

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useOnboardingStore, usePlanStore, useJournalStore } from '../../lib/store'
import { useDashboardFilters } from '../../lib/dashboard/filters'

const RadarChartCmp = dynamic(async () => {
  const m = await import('recharts')
  const RadarChart = ({ data }: { data: Array<{ metric: string; value: number }> }) => (
    <m.ResponsiveContainer width="100%" height={260}>
      <m.RadarChart data={data} outerRadius={80}>
        <m.PolarGrid stroke="rgba(255,255,255,0.12)" />
        <m.PolarAngleAxis dataKey="metric" tick={{ fill: '#D0D3E2', fontSize: 11 }} />
        <m.PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#D0D3E2', fontSize: 10 }} />
        <m.Radar dataKey="value" stroke="#C58AFF" fill="#C58AFF33" fillOpacity={0.6} />
      </m.RadarChart>
    </m.ResponsiveContainer>
  )
  RadarChart.displayName = 'RadarChart'
  return RadarChart
}, { ssr: false })

export default function RadarProfile() {
  const identity = useOnboardingStore((s) => s.identity)
  const focus = usePlanStore((s) => s.focus)
  const moods = useJournalStore((s) => s.moods)
  const tags = useDashboardFilters((s)=>s.tags)

  const data = useMemo(() => {
    const recentMood = moods.slice(-7).reduce((a,b)=>a+b.mood,0) / Math.max(1, moods.slice(-7).length)
    const clarity = Math.min(10, Math.max(2, Math.round((recentMood || 5) + (tags.includes('focus') ? 1.5 : 0))))
    const reflection = Math.min(10, Math.round(moods.length ? (moods.length % 10) + 3 : 4))
    const energy = Math.min(10, Math.round((recentMood || 5)))
    const resilience = Math.min(10, Math.round(5 + (focus.length ? 1 : 0)))
    const connection = Math.min(10, identity?.name ? 6 : 5)
    return [
      { metric: 'Clarity', value: clarity },
      { metric: 'Reflection', value: reflection },
      { metric: 'Energy', value: energy },
      { metric: 'Resilience', value: resilience },
      { metric: 'Connection', value: connection },
    ]
  }, [identity, focus, moods, tags])

  return (
    <div className="glass-surface p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Persona Radar</div>
        <div className="text-xs text-text-secondary">Adaptive</div>
      </div>
      <RadarChartCmp data={data} />
    </div>
  )
}
