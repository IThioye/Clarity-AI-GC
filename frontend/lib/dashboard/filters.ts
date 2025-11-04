import { create } from 'zustand'

export type DateRange = { start?: string; end?: string }

export type DashboardFilters = {
  tags: string[]
  dateRange: DateRange
  goals: string[]
  log: string[]
  setTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  setDateRange: (range: DateRange) => void
  setGoals: (goals: string[]) => void
  toggleGoal: (goal: string) => void
  addLog: (line: string) => void
  clear: () => void
}

export const useDashboardFilters = create<DashboardFilters>((set, get) => ({
  tags: [],
  dateRange: {},
  goals: [],
  log: [],
  setTags: (tags) => set({ tags }),
  toggleTag: (tag) => {
    const curr = get().tags
    const exists = curr.includes(tag)
    const next = exists ? curr.filter((t) => t !== tag) : [...curr, tag]
    set({ tags: next })
    get().addLog(`${exists ? 'Tag off' : 'Tag on'}: ${tag}`)
  },
  setDateRange: (range) => {
    set({ dateRange: range })
    const s = range.start ? new Date(range.start).toLocaleDateString() : '—'
    const e = range.end ? new Date(range.end).toLocaleDateString() : '—'
    get().addLog(`Range set: ${s} → ${e}`)
  },
  setGoals: (goals) => set({ goals }),
  toggleGoal: (goal) => {
    const curr = get().goals
    const exists = curr.includes(goal)
    const next = exists ? curr.filter((g) => g !== goal) : [...curr, goal]
    set({ goals: next })
    get().addLog(`${exists ? 'Goal off' : 'Goal on'}: ${goal}`)
  },
  addLog: (line) => set((s) => ({ log: [line, ...s.log].slice(0, 20) })),
  clear: () => set({ tags: [], dateRange: {}, goals: [], log: [] }),
}))
