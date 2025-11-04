"use client"

import { usePlanStore } from '../../lib/store'
import { useDashboardFilters } from '../../lib/dashboard/filters'

export default function ActionStrip() {
  const focus = usePlanStore((s)=>s.focus)
  const chosen = usePlanStore((s)=>s.chosen)
  const togglePlan = usePlanStore((s)=>s.toggle)
  const toggleTag = useDashboardFilters((s)=>s.toggleTag)
  const toggleGoalFilter = useDashboardFilters((s)=>s.toggleGoal)

  const activeIds = Object.keys(chosen).filter((k)=>chosen[k])

  return (
    <div className="glass-surface p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Action Strip</div>
        <div className="text-xs text-text-secondary">Tap to toggle filters</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {focus.map((f)=> (
          <button
            key={f}
            onClick={()=>toggleTag(f)}
            className="px-3 py-1.5 rounded-full text-xs glass hover:scale-[1.02] transition"
          >
            {f}
          </button>
        ))}
        {activeIds.map((id)=> (
          <button
            key={id}
            onClick={()=>{ toggleGoalFilter(id) }}
            onDoubleClick={()=>{ togglePlan(id) }}
            title="Click to filter, double-click to unselect in plan"
            className="px-3 py-1.5 rounded-full text-xs neon-edge hover:scale-[1.02] transition"
          >
            {id}
          </button>
        ))}
        {focus.length===0 && activeIds.length===0 && (
          <div className="text-xs text-text-secondary">No focus/goals yet — set some in Plan to see more here.</div>
        )}
      </div>
    </div>
  )
}
