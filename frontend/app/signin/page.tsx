"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('clarity_user_stub', JSON.stringify({ email, name }))
        }
      } catch {}
      router.push('/get-started' as Route)
    }, 600)
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-text-secondary">Sign in to your Clarity space. Your data stays on your device.</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-surface p-6 rounded-xl space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-text-secondary">Name or nickname</span>
            <Input
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-text-secondary">Email</span>
            <Input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Continue'}
          </Button>
          <div className="text-xs text-text-secondary text-center">
            By continuing you agree this app is prototype-only. No cloud sync. <Link href="/get-started" className="underline">Try without email</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
