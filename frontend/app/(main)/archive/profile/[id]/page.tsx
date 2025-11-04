'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { profiles, conversations } from '../../../../../lib/mock-data'

export default function ProfileArchivePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  const profile = useMemo(() => profiles.find((p) => p.id === id), [id])
  const profileConvos = useMemo(() => conversations.filter((c) => c.profileId === id), [id])

  if (!profile) {
    return (
      <div className="space-y-4">
        <div className="text-text-secondary">Profile not found.</div>
        <Link href="/archive" className="underline">Back to Archive</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <div className="text-sm text-text-secondary mt-1">Last active {profile.lastActive}</div>
          <p className="mt-4 text-text-secondary max-w-2xl">{profile.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-white/5">{t}</span>
            ))}
          </div>
        </div>
        <Link href="/archive" className="text-sm underline text-text-secondary hover:text-text-primary">Back</Link>
      </div>

      <section className="glass-surface p-6">
        <h2 className="text-xl mb-4">Conversations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileConvos.map((c) => (
            <Link key={c.id} href={`/archive/conversation/${c.id}`} className="glass p-4 rounded-lg hover:scale-[1.02] transition shadow-neon block">
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-text-secondary mt-1">{c.date} • {c.messageCount} messages</div>
              <div className="text-sm text-text-secondary mt-3 line-clamp-3">{c.snippet}</div>
            </Link>
          ))}
          {profileConvos.length === 0 && (
            <div className="col-span-full text-center text-text-secondary">No conversations yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
