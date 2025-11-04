"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { profiles as allProfiles, conversations as allConversations } from '../../../lib/mock-data'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Trash2, Eye, Link2, X } from 'lucide-react'

type Tag = string

export default function ArchivePage() {
  const [q, setQ] = useState('')
  const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set())
  const [focusedConversationId, setFocusedConversationId] = useState<string | null>(null)
  const [list, setList] = useState(() => [...allConversations])
  const [profileOpen, setProfileOpen] = useState(true)

  // Single-user profile (take the first for now)
  const profile = allProfiles[0]
  const allTags = useMemo(() => {
    const set = new Set<Tag>()
    list.forEach((c) => (c.tags || []).forEach((t) => set.add(t)))
    if (profile) profile.tags.forEach((t) => set.add(t))
    return Array.from(set).sort()
  }, [list, profile])

  const filteredConversations = useMemo(() => {
    const query = q.toLowerCase()
    return list.filter((c) => {
      const baseMatch = [c.title, c.snippet, c.date].some((v) => v.toLowerCase().includes(query))
      const tags = new Set(c.tags || [])
      const tagMatch = selectedTags.size === 0 || Array.from(selectedTags).every((t) => tags.has(t))
      return baseMatch && tagMatch
    })
  }, [q, list, selectedTags])

  function toggleTag(tag: Tag) {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  function clearFilters() {
    setQ('')
    setSelectedTags(new Set())
  }

  function deleteConversation(id: string) {
    setList((prev) => prev.filter((c) => c.id !== id))
    if (focusedConversationId === id) setFocusedConversationId(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Archive</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 bg-transparent"
            />
          </div>
          {(q || selectedTags.size > 0) && (
            <Button className="bg-white/10" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar: Single Profile */}
        <motion.aside
          layout
          className="col-span-12 md:col-span-4 glass-surface p-4 overflow-hidden"
          initial={{ borderColor: 'rgba(255,255,255,0.08)' }}
          animate={{ borderColor: 'rgba(143,200,255,0.22)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {profile && (
            <div className="rounded-xl bg-gradient-to-b from-[#8FC8FF0d] to-[#A78BFA0d] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-lg">{profile.name}</div>
                  <div className="text-xs text-text-secondary mt-1">Last active {profile.lastActive}</div>
                </div>
                <Button className="bg-white/10" onClick={() => setProfileOpen((v) => !v)}>
                  {profileOpen ? 'Hide' : 'Show'}
                </Button>
              </div>
              <AnimatePresence initial={false}>
                {profileOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="mt-4 text-sm text-text-secondary overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-text-secondary/80 mb-2">About Jane</div>
                        <p className="leading-relaxed">{profile.about || profile.summary}</p>
                      </div>
                      {profile.strengths && profile.strengths.length > 0 && (
                        <div>
                          <div className="text-xs uppercase tracking-wide text-text-secondary/80 mb-2">Strengths</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {profile.strengths.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {profile.preferences && profile.preferences.length > 0 && (
                        <div>
                          <div className="text-xs uppercase tracking-wide text-text-secondary/80 mb-2">Preferences</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {profile.preferences.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {profile.supports && profile.supports.length > 0 && (
                        <div>
                          <div className="text-xs uppercase tracking-wide text-text-secondary/80 mb-2">What helps</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {profile.supports.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {profile.tags.map((t) => (
                          <button
                            key={t}
                            onClick={() => toggleTag(t)}
                            className={`text-xs px-2 py-1 rounded border ${
                              selectedTags.has(t)
                                ? 'border-[var(--accent-500,#8FC8FF)] bg-white/10'
                                : 'border-white/10 bg-white/5'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.aside>

        {/* Main: Conversations */}
        <section className="col-span-12 md:col-span-8 space-y-4">
          {/* Filter toolbar */}
          <div className="glass-surface p-3 flex flex-wrap items-center gap-2 rounded-xl bg-gradient-to-r from-[#8FC8FF0d] via-transparent to-[#A78BFA0d]">
            <div className="text-xs text-text-secondary flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>
            {allTags.map((t) => (
              <button
                key={t}
                className={`text-xs px-2 py-1 rounded-full border transition ${
                  selectedTags.has(t)
                    ? 'border-[var(--accent-500,#8FC8FF)] bg-white/10'
                    : 'border-white/10 bg-white/5'
                }`}
                onClick={() => toggleTag(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Conversations list */}
          <div className="grid grid-cols-1 gap-4">
            {filteredConversations.map((c) => {
              const focused = focusedConversationId === c.id
              return (
                <motion.div
                  key={c.id}
                  layout
                  className={`glass p-4 rounded-lg transition shadow-neon ${
                    focused ? 'ring-1 ring-[var(--accent-500,#8FC8FF)] bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#8FC8FF] to-[#A78BFA]">{c.title}</div>
                      <div className="text-xs text-text-secondary mt-1">{c.date} • {c.messageCount} messages</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button className="bg-white/10" onClick={() => setFocusedConversationId(focused ? null : c.id)}>
                        <Eye className="w-4 h-4 mr-1" /> {focused ? 'Unfocus' : 'Focus'}
                      </Button>
                      <Link href={{ pathname: '/journal', query: { from: c.id } }} className="px-4 py-2 rounded-lg glass neon-edge focus-ring inline-flex items-center justify-center">
                        <Link2 className="w-4 h-4 mr-1" /> Link to new
                      </Link>
                      <Button className="bg-white/10" onClick={() => deleteConversation(c.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary mt-3">{c.snippet}</div>
                  {c.tags && c.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleTag(t)}
                          className={`text-xs px-2 py-1 rounded-full border ${
                            selectedTags.has(t)
                              ? 'border-[var(--accent-500,#8FC8FF)] bg-white/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
            {filteredConversations.length === 0 && (
              <div className="text-center text-text-secondary">No conversations found.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
