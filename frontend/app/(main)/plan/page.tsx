'use client'

import Link from 'next/link'
import { useOnboardingStore, usePlanStore } from '../../../lib/store'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Leaf, PenLine, Heart, Timer, CheckCircle2, Sparkles, Bell, Plus, X, ArrowRightCircle } from 'lucide-react'

const suggestions = [
  { id: 'breath', title: '2-min breathing', desc: 'Calm your mind with guided breaths.', icon: Leaf, minutes: 2, category: 'Reset' },
  { id: 'walk', title: '10-min walk', desc: 'Short outdoor reset to clear thoughts.', icon: Heart, minutes: 10, category: 'Energy' },
  { id: 'journal', title: 'Journal prompt', desc: 'Reflect on one learning today.', icon: PenLine, minutes: 5, category: 'Clarity' },
  { id: 'gratitude', title: 'Gratitude note', desc: 'Write 3 things you appreciate.', icon: Brain, minutes: 3, category: 'Mood' },
]

export default function PlanPage() {
  const chosen = usePlanStore((s) => s.chosen)
  const toggle = usePlanStore((s) => s.toggle)
  const name = useOnboardingStore((s) => s.identity.name || s.identity.nickname)
  const focus = usePlanStore((s) => s.focus)
  const setFocus = usePlanStore((s) => s.setFocus)
  const goals = usePlanStore((s) => s.goals)
  const addGoal = usePlanStore((s) => s.addGoal)
  const removeGoal = usePlanStore((s) => s.removeGoal)
  const toggleGoal = usePlanStore((s) => s.toggleGoal)
  const reminder = usePlanStore((s) => s.reminder)
  const setReminder = usePlanStore((s) => s.setReminder)
  const [goalText, setGoalText] = useState('')

  const activeIds = Object.keys(chosen).filter((k) => chosen[k])
  const totalMinutes = suggestions
    .filter((s) => activeIds.includes(s.id))
    .reduce((acc, s) => acc + (s as any).minutes, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      <div className="lg:col-span-4 xl:col-span-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-secondary">{name ? `${name}'s plan` : 'Your plan'}</div>
            <h1 className="text-2xl font-semibold tracking-[-0.01em]">Today, let’s keep it simple</h1>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="text-sm font-medium">Focus Areas</div>
            <p className="text-xs text-text-secondary mt-0.5">Tell Clarity what to prioritize.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Reduce stress','Build gratitude','Improve self-confidence','Better sleep','Focus & clarity','Emotional balance'].map((a) => {
            const active = focus.includes(a as any)
            return (
              <button
                key={a}
                onClick={() => setFocus(a as any)}
                className={`px-3 py-1.5 rounded-full text-sm border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${active ? 'neon-edge' : 'glass hover:border-white/10'}`}
              >
                {a}
              </button>
            )
          })}
        </div>
        {/* Suggestions */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="font-medium">Suggestions</div>
            <p className="text-xs text-text-secondary mt-0.5">Pick a few to build your plan.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass px-3 py-2 rounded-lg inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            onClick={() => {
              const firstThree = suggestions.slice(0, 3)
              firstThree.forEach((s) => toggle(s.id))
            }}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Auto-pick</span>
          </motion.button>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {suggestions.map((s, i) => {
            const active = !!chosen[s.id]
            const Icon = (s as any).icon
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggle(s.id)}
                className={`text-left glass p-4 rounded-xl border border-transparent hover:border-white/10 transition relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${active ? 'neon-edge' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg grid place-items-center ${active ? 'bg-white/10' : 'bg-white/5'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium leading-tight">{s.title}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                  <div className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5">
                    <Timer className="h-3.5 w-3.5" /> {(s as any).minutes}m
                  </div>
                </div>
                <div className="mt-3 text-[11px] tracking-wide opacity-80">{(s as any).category}</div>
                {active && (
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      className="absolute right-3 top-3"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-1 xl:col-span-2 space-y-4">
        <div className="glass rounded-xl p-4">
          <div className="text-sm text-text-secondary">Selected</div>
          <div className="mt-1 text-lg font-semibold">{activeIds.length} activities</div>
          <div className="mt-2 text-sm inline-flex items-center gap-2">
            <Timer className="h-4 w-4" /> Total ~{totalMinutes} min
          </div>
          <div className="mt-3 divide-y divide-white/5">
            {activeIds.length === 0 ? (
              <div className="text-sm text-text-secondary py-3">Pick a few to build your plan.</div>
            ) : (
              suggestions
                .filter((s) => activeIds.includes(s.id))
                .map((s) => {
                  const SmallIcon = (s as any).icon
                  return (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-md bg-white/5 grid place-items-center">
                          {SmallIcon ? <SmallIcon className="h-4 w-4" /> : null}
                        </div>
                        <div>
                          <div className="text-sm">{s.title}</div>
                          <div className="text-xs text-text-secondary">{(s as any).minutes} min</div>
                        </div>
                      </div>
                      <button onClick={() => toggle(s.id)} className="text-xs opacity-80 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded hover:scale-[1.01] transition">
                        remove
                      </button>
                    </div>
                  )
                })
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={activeIds.length === 0}
            className={`w-full mt-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
              activeIds.length === 0 ? 'glass opacity-60 cursor-not-allowed' : 'neon-edge'
            }`}
          >
            <Brain className="h-4 w-4" /> Start plan
          </motion.button>
        </div>

        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Goals</div>
            <div className="text-xs text-text-secondary">max 3</div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full grid place-items-center"
              style={{
                background: `conic-gradient(var(--color-neon) ${Math.round((goals.filter(g=>g.done).length/Math.max(goals.length||1,1))*100)}%, rgba(255,255,255,0.08) 0)`
              }}
            >
              <span className="text-xs font-medium">{goals.filter(g=>g.done).length}/{goals.length || 0}</span>
            </div>
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Add a micro-goal"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                />
                <button
                  onClick={() => {
                    const t = goalText.trim()
                    if (!t || goals.length >= 3) return
                    addGoal({ text: t, area: (focus[0] as any) })
                    setGoalText('')
                  }}
                  className={`px-3 rounded-lg inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${goals.length>=3 ? 'opacity-50 cursor-not-allowed glass' : 'neon-edge'}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {goals.length === 0 ? (
              <div className="text-sm text-text-secondary">No goals yet. Add one or auto-generate.</div>
            ) : (
              goals.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                  <button onClick={() => toggleGoal(g.id)} className={`h-5 w-5 rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${g.done ? 'bg-white/80' : 'bg-transparent'}`} />
                  <div className="flex-1 px-3 text-sm truncate">{g.text}</div>
                  <button onClick={() => removeGoal(g.id)} className="opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (goals.length >= 3) return
              const pool = suggestions
                .filter((s) => (focus.length ? focus.some((f) => ((s as any).category === 'Reset' && f==='Reduce stress') || f==='Focus & clarity' || f==='Emotional balance' || f==='Build gratitude' || f==='Improve self-confidence' || f==='Better sleep') : true))
                .map((s) => s.title)
              const picks = Array.from(new Set(pool)).slice(0, 3 - goals.length)
              picks.forEach((p) => addGoal({ text: p, area: (focus[0] as any) }))
            }}
            className={`w-full py-2 rounded-lg inline-flex items-center justify-center gap-2 glass hover:scale-[1.01] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${goals.length>=3 ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Sparkles className="h-4 w-4" /> Auto-generate
          </motion.button>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium inline-flex items-center gap-2"><Bell className="h-4 w-4" /> Reflection reminder</div>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm"><span className="font-semibold bg-gradient-to-r from-[#C58AFF] via-[#B596FF] to-[#8FC8FF] bg-clip-text text-transparent">Clarity+</span></div>
              <div className="text-lg font-semibold mt-1">Unlock adaptive action plans</div>
              <div className="text-sm opacity-80">Advanced coaching insights tailored to your focus.</div>
            </div>
            <Link href="/pricing" className="neon-edge px-3 py-2 rounded-lg inline-flex items-center gap-2 text-sm hover:scale-[1.02] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
              Upgrade <ArrowRightCircle className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

