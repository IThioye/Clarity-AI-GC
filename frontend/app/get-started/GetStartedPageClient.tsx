"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useOnboardingStore } from '../../lib/store'

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="text-text-secondary mt-1">{subtitle}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </Card>
  )
}

function ChoiceRow({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-2 rounded-lg border focus-ring text-sm leading-5 ${value === o ? 'glass neon-edge' : 'border-white/15 text-text-secondary'}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function GetStartedPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { step, setStep, update, complete, completed, identity, experience, goals, inner, space, reset } = useOnboardingStore()
  const [emailInput, setEmailInput] = useState<string>((identity as any).email || '')
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [pwdErr, setPwdErr] = useState<string | null>(null)
  const TOTAL_STEPS = 6

  // Do not auto-redirect to dashboard; allow returning users to restart onboarding.
  // If you want to force redirect in some contexts, pass `?auto=1` and handle it here.
  useEffect(() => {
    const auto = searchParams?.get('auto') === '1'
    if (completed && auto) router.replace('/dashboard')
  }, [completed, router, searchParams])

  // Optional URL trigger to reset onboarding state: /get-started?reset=1
  useEffect(() => {
    const shouldReset = searchParams?.get('reset') === '1'
    if (shouldReset) {
      reset()
      setStep(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function next() {
    setStep(step + 1)
  }
  function back() {
    setStep(Math.max(0, step - 1))
  }

  function isEmailValid(email: string) {
    return /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email)
  }

  function validateStep(s: number): boolean {
    if (s === 0) {
      const first = (identity.name || '').split(' ')[0] || ''
      const emailOk = isEmailValid(emailInput)
      const pwdOk = pwd.length >= 6 && pwd === pwd2
      return Boolean((identity.nickname || first) && emailOk && pwdOk)
    }
    // Fallback: allow other steps by default (can add richer rules later)
    return true
  }

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-5 items-center py-2">
        <div />
        <div className="text-center col-span-3">
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">Let’s get to know you</h1>
          <p className="text-sm md:text-base text-text-secondary mt-1 whitespace-nowrap">Warm, private, and designed to reflect you back more accurately.</p>
        </div>
        <div className="justify-self-end">
          <Button
            className="border border-white/15 bg-transparent"
            onClick={() => {
              reset()
              setStep(0)
            }}
          >
            Start over
          </Button>
        </div>
      </div>
      {/* Smooth progress indicator */}
      <div className="mx-auto w-[92%] relative h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{
            background:
              'linear-gradient(90deg, var(--acc-blue), var(--acc-violet), var(--acc-rose))',
          }}
        />
      </div>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Section
              title="Identity & Trust"
              subtitle="This space is yours — encrypted and private on your device. Share what feels right."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">First name</span>
                  <Input
                    placeholder="First name"
                    value={(identity.name || '').split(' ')[0] || ''}
                    onChange={(e)=> {
                      const last = (identity.name || '').split(' ').slice(1).join(' ')
                      update({ identity: { ...identity, name: [e.target.value, last].filter(Boolean).join(' ') } as any })
                    }}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">Last name</span>
                  <Input
                    placeholder="Last name"
                    value={(identity.name || '').split(' ').slice(1).join(' ')}
                    onChange={(e)=> {
                      const first = (identity.name || '').split(' ')[0] || ''
                      update({ identity: { ...identity, name: [first, e.target.value].filter(Boolean).join(' ') } as any })
                    }}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">Nickname (optional)</span>
                  <Input placeholder="Optional" value={identity.nickname || ''} onChange={(e)=> update({ identity: { ...identity, nickname: e.target.value } as any })} />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1.5">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-text-secondary">Email</span>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onBlur={() => update({ identity: { ...identity, email: emailInput } as any })}
                  />
                </label>
                <div className="hidden md:block" />
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">Password</span>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={pwd}
                    onChange={(e) => { setPwd(e.target.value); setPwdErr(null) }}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">Confirm password</span>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    value={pwd2}
                    onChange={(e) => { setPwd2(e.target.value); setPwdErr(null) }}
                    onBlur={() => {
                      if (pwd && pwd2 && pwd !== pwd2) setPwdErr('Passwords do not match')
                    }}
                  />
                </label>
                {pwdErr && (
                  <div className="text-sm text-rose-300 md:col-span-3">{pwdErr}</div>
                )}
                <p className="text-xs text-text-secondary md:col-span-3">We’ll securely authenticate later. For now this just saves your email to your profile.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">Date of birth</span>
                  <Input
                    type="date"
                    value={identity.dateOfBirth || ''}
                    onChange={(e) => update({ identity: { ...identity, dateOfBirth: e.target.value } as any })}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-text-secondary">Favorite animal</span>
                  <Input
                    placeholder="e.g. fox, dolphin, panda"
                    value={identity.favoriteAnimal || ''}
                    onChange={(e) => update({ identity: { ...identity, favoriteAnimal: e.target.value } as any })}
                  />
                </label>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs text-text-secondary">You can change this anytime in Settings.</span>
                <Button onClick={next}>Continue</Button>
              </div>
            </Section>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Section title="How Do You Experience Life?" subtitle="Pick what feels like you.">
              <div className="space-y-5">
                <div>
                  <div className="text-sm text-text-secondary mb-2">When You’re Stressed, You Tend To…</div>
                  <ChoiceRow
                    options={["Talk", "Think", "Distract"]}
                    value={experience.copingPreference}
                    onChange={(v) => update({ experience: { ...experience, copingPreference: v as any } })}
                  />
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-2">Which Word Fits Most Days?</div>
                  <ChoiceRow
                    options={["Calm", "Energetic", "Reflective", "Driven", "Sensitive", "Steady"]}
                    value={experience.baselineWord}
                    onChange={(v) => update({ experience: { ...experience, baselineWord: v as any } })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">Describe Feelings Easily (1–5)</span>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={experience.emotionalGranularity || ''}
                      onChange={(e) => update({ experience: { ...experience, emotionalGranularity: Number(e.target.value) } })}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">When Things Go Wrong, You Usually…</span>
                    <ChoiceRow
                      options={["Analyze", "Retry", "Talk", "Avoid", "Reflect"]}
                      value={experience.responseStyle}
                      onChange={(v) => update({ experience: { ...experience, responseStyle: v as any } })}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">How Often Do You Journal?</span>
                    <ChoiceRow
                      options={["Never", "Sometimes", "Weekly", "Daily"]}
                      value={experience.journalingFrequency}
                      onChange={(v) => update({ experience: { ...experience, journalingFrequency: v as any } })}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">What Helps You Feel Grounded?</span>
                    <ChoiceRow
                      options={["Writing", "Nature", "People", "Action", "Art", "Learning", "Rest"]}
                      value={experience.grounding}
                      onChange={(v) => update({ experience: { ...experience, grounding: v as any } })}
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button onClick={back} className="border border-white/15 bg-transparent">Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </Section>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Section title="What Matters To You Right Now?" subtitle="Set your compass.">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-text-secondary mb-2">Primary Direction</div>
                  <ChoiceRow
                    options={["Healing", "Focus", "Growth", "Balance", "Clarity", "Connection"]}
                    value={goals.direction}
                    onChange={(v) => update({ goals: { ...goals, direction: v as any } })}
                  />
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-2">What Should This Journal Help With?</div>
                  <ChoiceRow
                    options={["Stress", "Patterns", "Creativity", "Track", "Plan"]}
                    value={(goals.helpWith || [])[0]}
                    onChange={(v) => update({ goals: { ...goals, helpWith: [v as any] } })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">Progress Feels Better As…</span>
                    <ChoiceRow
                      options={["Small Wins", "Deep Insights"]}
                      value={goals.progressPreference}
                      onChange={(v) => update({ goals: { ...goals, progressPreference: v as any } })}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">Comfort Exploring Personal Questions (1–5)</span>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={goals.depthComfort || ''}
                      onChange={(e) => update({ goals: { ...goals, depthComfort: Number(e.target.value) } })}
                    />
                  </label>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-2">Guide Tone</div>
                  <ChoiceRow
                    options={["Factual", "Intuitive"]}
                    value={goals.toneStyle}
                    onChange={(v) => update({ goals: { ...goals, toneStyle: v as any } })}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={back} className="border border-white/15 bg-transparent">Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </Section>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Section title="Meet Your Inner World" subtitle="A quick self-portrait.">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-text-secondary mb-2">Facing Uncertainty, You Tend To…</div>
                  <ChoiceRow
                    options={["Control", "Flow"]}
                    value={inner.controlOrientation}
                    onChange={(v) => update({ inner: { ...inner, controlOrientation: v as any } })}
                  />
                </div>
                <label className="space-y-1">
                  <span className="text-sm text-text-secondary">Three Words You Use To Describe Yourself</span>
                  <Input
                    placeholder="e.g. curious, steady, creative"
                    value={(inner.selfWords || []).join(', ')}
                    onChange={(e) => update({ inner: { ...inner, selfWords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
                  />
                </label>
                <div>
                  <div className="text-sm text-text-secondary mb-2">Which Phrase Feels Most You?</div>
                  <ChoiceRow
                    options={["Analyze", "Feel", "Act", "Share"]}
                    value={inner.phrase}
                    onChange={(v) => update({ inner: { ...inner, phrase: v as any } })}
                  />
                </div>
                <label className="space-y-1">
                  <span className="text-sm text-text-secondary">When Was The Last Time You Surprised Yourself?</span>
                  <Input
                    placeholder="A sentence or two"
                    value={inner.surpriseNote || ''}
                    onChange={(e) => update({ inner: { ...inner, surpriseNote: e.target.value } })}
                  />
                </label>
                <div className="glass-surface p-4 rounded-lg text-sm">
                  <div className="font-medium mb-1">Your Reflection Card</div>
                  <div className="text-text-secondary">You tend to process through {inner.phrase || '…'} — an insight seeker in progress.</div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={back} className="border border-white/15 bg-transparent">Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </Section>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Section title="Shape Your Space" subtitle="Choose how we check in and the feel of your journal.">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-sm text-text-secondary mb-2">Check-Ins</div>
                    <ChoiceRow
                      options={["Daily", "Ad Hoc"]}
                      value={space.checkIns}
                      onChange={(v) => update({ space: { ...space, checkIns: v as any } })}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-2">Guide Style</div>
                    <ChoiceRow
                      options={["Reflective Questions", "Just Listen"]}
                      value={space.guideStyle}
                      onChange={(v) => update({ space: { ...space, guideStyle: v as any } })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-text-secondary mb-2">Mood</div>
                    <ChoiceRow
                      options={["Cool", "Warm", "Balanced"]}
                      value={space.mood}
                      onChange={(v) => update({ space: { ...space, mood: v as any } })}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-2">Tone Color</div>
                    <ChoiceRow
                      options={["Blue", "Violet", "Rose"]}
                      value={space.toneColor}
                      onChange={(v) => update({ space: { ...space, toneColor: v as any } })}
                    />
                  </div>
                  <label className="space-y-1">
                    <span className="text-sm text-text-secondary">Voice notes</span>
                    <button
                      type="button"
                      onClick={() => update({ space: { ...space, voiceNotes: !space.voiceNotes } })}
                      className={`px-3 py-2 rounded-lg border ${space.voiceNotes ? 'glass neon-edge' : 'border-white/15 text-text-secondary'}`}
                    >
                      {space.voiceNotes ? 'Enabled' : 'Disabled'}
                    </button>
                  </label>
                </div>
              </div>
              <div className="flex justify-between">
                <Button onClick={back} className="border border-white/15 bg-transparent">Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </Section>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Card className="p-10 text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mx-auto w-32 h-32 rounded-full"
                style={{
                  background:
                    'radial-gradient(40% 40% at 70% 30%, var(--acc-blue) 0%, transparent 70%), radial-gradient(40% 40% at 30% 70%, var(--acc-rose) 0%, transparent 70%)',
                }}
              />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Your space is ready</h2>
                <p className="text-text-secondary">You’ve unlocked The First Page. Your journal knows how you like to think.</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => { complete(); router.replace('/dashboard') }}>Enter Dashboard</Button>
                <Button onClick={back} className="border border-white/15 bg-transparent">Back</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GetStartedPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GetStartedPageClient />
        </Suspense>
    )
}