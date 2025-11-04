"use client"

import { useMemo, useRef, useState } from 'react'
import { useJournalStore } from '../../lib/store'
import { generateMockMoods } from '../../lib/dashboard/mock'

function getLast7DaysLabels() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const now = new Date()
  const arr: string[] = []
  for (let i=6;i>=0;i--) {
    const d = new Date(now)
    d.setDate(now.getDate()-i)
    arr.push(days[d.getDay()])
  }
  return arr
}

export default function WeeklyOverview() {
  const moods = useJournalStore((s) => s.moods)

  const series = useMemo(() => {
    const baseline = generateMockMoods(7).map(p => ({ date: p.date, time: p.label, mood: p.mood }))
    return baseline.map((pt, i) => {
      const found = moods.find(m => m.date === pt.date)
      return { index: i, time: pt.time, mood: found?.mood ?? pt.mood }
    })
  }, [moods])

  const streak = useMemo(() => {
    let s = 0
    const today = new Date()
    for (let i=0;i<30;i++) {
      const d = new Date(today)
      d.setDate(today.getDate()-i)
      const key = d.toISOString().slice(0,10)
      const exists = moods.some((m)=>m.date===key)
      if (exists) s++
      else break
    }
    return s
  }, [moods])

  return (
    <div className="glass-surface p-6 rounded-2xl bg-gradient-to-br from-[#8FC8FF0f] via-transparent to-[#C58AFF0f]">
      <h3 className="mb-3">Mood over time <span className="ml-1 text-[10px] opacity-60">{series.length} pts</span></h3>
      <ChartSpark data={series.map(s=>s.mood)} labels={series.map(s=>s.time)} />
      <div className="mt-2 text-xs text-text-secondary">
        {streak>0 ? `You’ve reflected ${streak} ${streak===1?'day':'days'} in a row — keep it going 🌱` : 'Start a gentle streak'}
      </div>
    </div>
  )
}


function ChartSpark({ data, labels }: { data: number[]; labels: string[] }) {
  const w = 680
  const h = 240
  const padX = 24
  const padY = 20
  const n = data.length
  const sx = (i: number) => padX + (i * (w - padX * 2)) / Math.max(1, n - 1)
  const sy = (m: number) => padY + (h - padY * 2) * (1 - Math.max(0, Math.min(10, m)) / 10)

  const path = useMemo(() => data.reduce((d, m, i) => {
    const x = sx(i)
    const y = sy(m)
    return d + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, ''), [data, sx, sy])

  const area = useMemo(() => path + ` L ${padX + (w - padX * 2)} ${h - padY} L ${padX} ${h - padY} Z`, [path, padX, w, h, padY])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    // Find nearest index by x
    let nearest = 0
    let best = Infinity
    for (let i=0;i<n;i++) {
      const dx = Math.abs(x - sx(i))
      if (dx < best) { best = dx; nearest = i }
    }
    setHoverIdx(nearest)
  }
  function onLeave() { setHoverIdx(null) }

  const gradientId = 'weekly-line-grad'

  return (
    <div className="w-full overflow-hidden relative">
      {/* Tooltip */}
      {hoverIdx !== null && (
        <div className="pointer-events-none absolute -mt-2 text-[11px] px-2 py-1 rounded-md bg-black/60 border border-white/10"
             style={{ left: `calc(${(sx(hoverIdx)/w)*100}% - 28px)`, top: 8 }}>
          <div className="opacity-80">{labels[hoverIdx]}</div>
          <div className="font-semibold">{data[hoverIdx]}/10</div>
        </div>
      )}
      <svg ref={svgRef} onMouseMove={onMove} onMouseLeave={onLeave} viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8FC8FF"/>
            <stop offset="100%" stopColor="#A78BFA"/>
          </linearGradient>
        </defs>
        {/* Zones */}
        <rect x={0} y={sy(3.5)} width={w} height={h - sy(3.5)} fill="#A78BFA" opacity={0.06} />
        <rect x={0} y={sy(6.5)} width={w} height={sy(3.5) - sy(6.5)} fill="#8FC8FF" opacity={0.08} />
        <rect x={0} y={sy(10)} width={w} height={sy(6.5) - sy(10)} fill="#94A3B8" opacity={0.08} />
        {/* Grid */}
        <g opacity={0.12} stroke="currentColor">
          {[...Array(5)].map((_, i) => (
            <line key={i} x1={padX} y1={padY + (i * (h - padY * 2)) / 4} x2={w - padX} y2={padY + (i * (h - padY * 2)) / 4} />
          ))}
        </g>
        {/* Area and Line with gradient + subtle animation */}
        <path d={area} fill="#8FC8FF" opacity={0.12} />
        <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth={2} style={{ transition: 'd 200ms ease' }} />
        {/* Hover guide + Dot */}
        {hoverIdx !== null && (
          <>
            <line x1={sx(hoverIdx)} y1={padY} x2={sx(hoverIdx)} y2={h - padY} stroke="#8FC8FF" strokeOpacity={0.25} />
            <circle cx={sx(hoverIdx)} cy={sy(data[hoverIdx])} r={4} fill="#8FC8FF" />
          </>
        )}
        {/* Static dots */}
        {data.map((m, i) => (
          <circle key={i} cx={sx(i)} cy={sy(m)} r={2.2} fill="#8FC8FF" />
        ))}
      </svg>
    </div>
  )
}
