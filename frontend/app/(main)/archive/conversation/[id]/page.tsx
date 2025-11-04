'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { conversations, profiles } from '../../../../../lib/mock-data'

export default function ConversationArchivePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  const convo = useMemo(() => conversations.find((c) => c.id === id), [id])
  const profile = useMemo(() => (convo ? profiles.find((p) => p.id === convo.profileId) : undefined), [convo])

  if (!convo) {
    return (
      <div className="space-y-4">
        <div className="text-text-secondary">Conversation not found.</div>
        <Link href="/archive" className="underline">Back to Archive</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{convo.title}</h1>
          <div className="text-sm text-text-secondary mt-1">{convo.date} • {convo.messageCount} messages</div>
          {profile && (
            <div className="mt-2 text-sm">
              With <Link href={`/archive/profile/${profile.id}`} className="underline">{profile.name}</Link>
            </div>
          )}
        </div>
        <Link href="/archive" className="text-sm underline text-text-secondary hover:text-text-primary">Back</Link>
      </div>

      <section className="glass-surface p-6">
        <h2 className="text-xl mb-2">Summary</h2>
        <p className="text-text-secondary">{convo.snippet}</p>
      </section>

      <section className="glass-surface p-6">
        <h2 className="text-xl mb-2">Messages (placeholder)</h2>
        <div className="text-text-secondary text-sm">This is a placeholder for message transcripts the Archivist agent would reference.</div>
      </section>
    </div>
  )
}
