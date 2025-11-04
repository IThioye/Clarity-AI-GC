'use client'

import Link from 'next/link'
import { recentReflections } from '../../../lib/mock-data'
import NeuralMap from '../../../components/dashboard/NeuralMap'
import RadarProfile from '../../../components/dashboard/RadarProfile'
import StreakRing from '../../../components/dashboard/StreakRing'
import ActionStrip from '../../../components/dashboard/ActionStrip'
import DashboardWelcome from '../../../components/dashboard/DashboardWelcome'
import MoodQuickInput from '../../../components/dashboard/MoodQuickInput'
import WeeklyOverview from '../../../components/dashboard/WeeklyOverview'
import QuickStats from '../../../components/dashboard/QuickStats'
import MicroInsightPreview from '../../../components/dashboard/MicroInsightPreview'
import UpsellBanner from '../../../components/dashboard/UpsellBanner'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Row A: Welcome (reduced width) + Stats on the right */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardWelcome />
        </div>
        <div>
          <QuickStats />
        </div>
      </section>

      {/* Row B: Mood input + Weekly overview (prominent) + Micro insight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MoodQuickInput />
          <WeeklyOverview />
        </div>
        <div className="space-y-6">
          <MicroInsightPreview />
          {/* Neural Map placed above Clarity+ */}
          <NeuralMap />
        </div>
      </section>

      {/* Full-width Clarity+ banner */}
      <section>
        <UpsellBanner />
      </section>

      {/* Signals + Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionStrip />
        <RadarProfile />
        <StreakRing />
      </section>

      <section className="glass-surface p-6 rounded-2xl">
        <h2 className="text-xl mb-4">Recent Reflections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentReflections.map((r) => (
            <div key={r.id} className="glass p-4 rounded-lg hover:scale-[1.02] transition shadow-neon">
              <div className="text-sm text-text-secondary">{r.date}</div>
              <div className="mt-2 font-medium">{r.title}</div>
              <div className="mt-2 text-sm line-clamp-3 text-text-secondary">{r.excerpt}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

