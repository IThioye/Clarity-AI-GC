"use client"

import Link from 'next/link'

export default function UpsellBanner() {
  return (
    <div className="glass-surface p-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#C58AFF1a] via-[#B596FF10] to-[#8FC8FF1a]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm"><span className="font-semibold bg-gradient-to-r from-[#C58AFF] via-[#B596FF] to-[#8FC8FF] bg-clip-text text-transparent">Clarity+</span></div>
          <div className="text-lg font-semibold mt-1">Unlock deeper insights</div>
          <div className="text-sm opacity-80">Adaptive summaries, richer patterns, and gentle nudges.</div>
        </div>
        <Link href="/pricing" className="neon-edge px-3 py-2 rounded-lg inline-flex items-center gap-2 text-sm hover:scale-[1.02] transition">Upgrade →</Link>
      </div>
    </div>
  )
}
