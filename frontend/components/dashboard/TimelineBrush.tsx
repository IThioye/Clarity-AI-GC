'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useJournalStore } from '../../lib/store'
import { generateMockMoods } from '../../lib/dashboard/mock'

export default function TimelineBrush() {
  const moods = useJournalStore((s)=>s.moods)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(()=>{
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(()=> setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return ()=> ro.disconnect()
  }, [])

  const data = useMemo(()=>{
    const base = generateMockMoods(21)
    return base.map(pt => {
      const real = moods.find(m=>m.date===pt.date)
      return { date: pt.date, label: pt.label, mood: real?.mood ?? pt.mood }
    })
  }, [moods])

  const n = data.length
  const h = 180
  const padX = 16
  const padY = 14
  const sx = (i: number) => padX + (i * (Math.max(0, width - padX * 2))) / Math.max(1, n - 1)
  const sy = (m: number) => padY + (h - padY * 2) * (1 - Math.max(0, Math.min(10, m)) / 10)
  const dPath = data.reduce((d, pt, i) => {
    const x = sx(i)
    const y = sy(pt.mood)
    return d + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')
  const area = dPath + ` L ${sx(n-1)} ${h - padY} L ${sx(0)} ${h - padY} Z`

  return (
    <div className="glass-surface p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Timeline <span className="ml-1 text-[10px] opacity-60">{n} pts</span></div>
        <div className="text-xs text-text-secondary">21 days</div>
      </div>
      <div ref={containerRef} className="relative h-[180px] w-full">
        {width > 0 && (
          <svg className="absolute inset-0" width={width} height={h}>
            {/* Zones (brand) */}
            <rect x={0} y={sy(3.5)} width={width} height={h - sy(3.5)} fill="#A78BFA" opacity={0.05} />
            <rect x={0} y={sy(6.5)} width={width} height={sy(3.5) - sy(6.5)} fill="#8FC8FF" opacity={0.07} />
            <rect x={0} y={sy(10)} width={width} height={sy(6.5) - sy(10)} fill="#94A3B8" opacity={0.07} />
            {/* Grid */}
            <g opacity={0.12} stroke="currentColor">
              {[...Array(4)].map((_, i) => (
                <line key={i} x1={padX} y1={padY + (i * (h - padY * 2)) / 3} x2={width - padX} y2={padY + (i * (h - padY * 2)) / 3} />
              ))}
            </g>
            {/* Area & Line */}
            <path d={area} fill="#8FC8FF" opacity={0.12} />
            <path d={dPath} fill="none" stroke="#8FC8FF" strokeWidth={2} />
            {/* Dots */}
            {data.map((pt, i) => (
              <circle key={i} cx={sx(i)} cy={sy(pt.mood)} r={2} fill="#8FC8FF" />
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
