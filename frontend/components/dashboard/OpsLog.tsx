"use client"

import { useDashboardFilters } from '../../lib/dashboard/filters'

export default function OpsLog() {
  const log = useDashboardFilters((s)=>s.log)
  const clear = useDashboardFilters((s)=>s.clear)

  return (
    <div className="glass-surface p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Ops Log</div>
        <button onClick={clear} className="text-xs underline text-text-secondary hover:text-text-primary">Clear</button>
      </div>
      <div className="h-28 overflow-y-auto text-xs space-y-1">
        {log.length === 0 ? (
          <div className="text-text-secondary">Console idle — interact with the dashboard to see events.</div>
        ) : (
          log.map((l, i) => (
            <div key={i} className="opacity-90">{l}</div>
          ))
        )}
      </div>
    </div>
  )
}
