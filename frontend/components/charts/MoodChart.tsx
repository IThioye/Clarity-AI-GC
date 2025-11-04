'use client'

import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts'

type Props = {
  data: { time: string; mood: number }[]
  stroke?: string
  showZones?: boolean
}

export default function MoodChart({ data, stroke = '#8FC8FF', showZones = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{w: number; h: number}>({ w: 0, h: 256 })
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setSize({ w, h: 256 })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth, h: 256 })
    return () => ro.disconnect()
  }, [])
  const firstX = data?.[0]?.time
  const lastX = data?.[data.length - 1]?.time
  // Build a simple sparkline path as a fallback
  const spark = (() => {
    const n = data?.length ?? 0
    if (n === 0 || size.w === 0) return ''
    const w = size.w
    const h = size.h
    const padX = 8
    const padY = 8
    const sx = (i: number) => padX + (i * (w - padX * 2)) / Math.max(1, n - 1)
    const sy = (m: number) => padY + (h - padY * 2) * (1 - m / 10)
    let d = ''
    data.forEach((pt, i) => {
      const x = sx(i)
      const y = sy(pt.mood)
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    })
    return d
  })()
  return (
    <div ref={containerRef} className="h-64 relative">
      {/* Fallback sparkline so something is always visible */}
      {size.w > 0 && (
        <svg className="absolute inset-0" width={size.w} height={size.h} aria-hidden>
          <path d={spark} fill="none" stroke={stroke} strokeWidth={1.5} opacity={0.65} />
        </svg>
      )}
      {size.w > 0 && (
        <LineChart width={size.w} height={size.h} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="time" stroke="#D0D3E2"/>
          <YAxis domain={[0, 10]} stroke="#D0D3E2"/>
          <Tooltip contentStyle={{ background:'rgba(13,15,34,0.9)', border:'1px solid #FFFFFF15', color:'#F3F4FA' }} />
          {showZones && firstX && lastX && (
            <>
              <ReferenceArea x1={firstX} x2={lastX} y1={0} y2={3.5} fill="#94A3B8" fillOpacity={0.08} ifOverflow="extendDomain" />
              <ReferenceArea x1={firstX} x2={lastX} y1={3.5} y2={6.5} fill="#8FC8FF" fillOpacity={0.1} ifOverflow="extendDomain" />
              <ReferenceArea x1={firstX} x2={lastX} y1={6.5} y2={10} fill="#A78BFA" fillOpacity={0.1} ifOverflow="extendDomain" />
            </>
          )}
          <Line type="monotone" dataKey="mood" stroke={stroke} strokeWidth={2} dot={false} />
        </LineChart>
      )}
    </div>
  )
}
