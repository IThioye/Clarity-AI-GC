// Deterministic mock mood generator used by dashboard charts
// Ensures WeeklyOverview and Timeline show the same history when real data is missing

function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type MockPoint = { date: string; label: string; mood: number }

export function generateMockMoods(days: number, endDate: Date = new Date()): MockPoint[] {
  // Seed from YYYYMMDD of endDate so it stays stable within a day
  const seed = parseInt(endDate.toISOString().slice(0,10).replace(/-/g, ''), 10)
  const rand = mulberry32(seed)
  const out: MockPoint[] = []
  const locale = undefined
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endDate)
    d.setDate(endDate.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    // smooth wave between 4..8 with slight deterministic noise
    const idx = days - 1 - i
    const wave = 6 + Math.sin(idx / 2) * 1.2
    const noise = (rand() - 0.5) * 0.8
    const mood = Math.max(4, Math.min(8.5, Math.round((wave + noise) * 10) / 10))
    out.push({ date, label, mood })
  }
  return out
}
