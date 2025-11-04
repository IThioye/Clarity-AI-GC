"use client"

import { useMemo, useState } from 'react'
import { useDashboardFilters } from '../../lib/dashboard/filters'
import { keywords } from '../../lib/mock-data'

function polarToXY(r: number, angle: number) {
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) }
}

export default function NeuralMap() {
  const { tags, toggleTag, addLog } = useDashboardFilters()
  const [hover, setHover] = useState<string | null>(null)

  const nodes = useMemo(() => {
    const base = keywords.length ? keywords : ['focus','gratitude','planning','breathing','energy','sleep']
    const n = base.length
    const r = 95
    return base.map((k, i) => {
      const angle = (i / n) * Math.PI * 2
      const { x, y } = polarToXY(r, angle)
      return { id: k, x, y, angle }
    })
  }, [])

  return (
    <div className="glass-surface p-4 rounded-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Neural Map</div>
        <div className="text-xs text-text-secondary">Click nodes to filter</div>
      </div>
      <div className="relative h-[256px]">
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative h-[220px] w-[220px]">
            {/* edges */}
            <svg className="absolute inset-0 h-full w-full" viewBox="-140 -140 280 280">
              {(() => {
                const n = nodes.length
                const lines: any[] = []
                for (let i = 0; i < n; i++) {
                  const a = nodes[i]
                  const b = nodes[(i + 1) % n] // ring edge
                  // Glow underlay
                  lines.push(
                    <line
                      key={`${a.id}-${b.id}-ring-glow`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="#8FC8FF"
                      strokeOpacity={0.28}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  )
                  // Main line
                  lines.push(
                    <line
                      key={`${a.id}-${b.id}-ring`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth={0.8}
                    />
                  )
                  // structural chord to opposite node for light structure (avoids hairball)
                  if (n > 4 && i < Math.floor(n / 2)) {
                    const c = nodes[(i + Math.floor(n / 2)) % n]
                    // Glow underlay for chord
                    lines.push(
                      <line
                        key={`${a.id}-${c.id}-chord-glow`}
                        x1={a.x}
                        y1={a.y}
                        x2={c.x}
                        y2={c.y}
                        stroke="#8FC8FF"
                        strokeOpacity={0.18}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                      />
                    )
                    // Main dashed chord
                    lines.push(
                      <line
                        key={`${a.id}-${c.id}-chord`}
                        x1={a.x}
                        y1={a.y}
                        x2={c.x}
                        y2={c.y}
                        stroke="rgba(255,255,255,0.6)"
                        strokeDasharray="3 3"
                        strokeWidth={0.6}
                      />
                    )
                  }
                }
                return lines
              })()}
            </svg>
            {/* nodes */}
            {nodes.map((n) => {
              const active = tags.includes(n.id)
              const isHover = hover === n.id
              return (
                <button
                  key={n.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-xs backdrop-blur-md glass border border-white/10 select-none ${active ? '' : ''}`}
                  style={{ left: 110 + n.x, top: 110 + n.y, transformOrigin: 'center' }}
                  aria-pressed={active}
                  title={active ? `Selected: ${n.id}` : `Click to focus: ${n.id}`}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => {
                    toggleTag(n.id)
                    addLog(`Node ${active ? 'deactivated' : 'activated'}: ${n.id}`)
                  }}
                >
                  <span className={`relative z-10`}>{n.id}</span>
                  {/* Always-glow (non-layout-shifting) */}
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-[#8FC8FF]" style={{ boxShadow: '0 0 16px 2px rgba(143,200,255,0.35)' }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-text-secondary">
        <div>Ring shows core focuses. Click a focus to filter and highlight its neighbors.</div>
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span>Filtering by:</span>
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full border border-white/10 text-[11px] bg-white/5">{t}</span>
            ))}
            {/* Related: immediate neighbors in the ring */}
            {(() => {
              const n = nodes.length
              if (n === 0) return null
              const first = tags[0]
              const idx = nodes.findIndex(nd => nd.id === first)
              if (idx < 0) return null
              const left = nodes[(idx - 1 + n) % n]?.id
              const right = nodes[(idx + 1) % n]?.id
              return (
                <span className="ml-2">
                  Related:
                  {left && <span className="ml-1 px-2 py-0.5 rounded-full border border-white/10 text-[11px] bg-white/5">{left}</span>}
                  {right && <span className="ml-1 px-2 py-0.5 rounded-full border border-white/10 text-[11px] bg-white/5">{right}</span>}
                </span>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
