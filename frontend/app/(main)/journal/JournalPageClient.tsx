'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
// removed framer-motion animations for a cleaner, modern feel
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Link2, Mic, Sparkles, ShieldCheck, Send } from 'lucide-react'
import { useJournalStore, type ChatMessage } from '../../../lib/store'
import { conversations as archiveConversations } from '../../../lib/mock-data'
import { sendChatMessage } from '../../../lib/api/socket'

function nowTime() {
  const d = new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function JournalPageClient() {
  const qp = useSearchParams()
  const from = qp.get('from')

  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [typing, setTyping] = useState(false)
  // store state
  const { chat, setChat, addMood, moods, addJournal, journal, clearChat, removeJournal } = useJournalStore()
  const [speak, setSpeak] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const firstRender = useRef(true)
  const [mode, setMode] = useState<'chat' | 'journal' | 'voice'>('chat')
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const recogRef = useRef<any>(null)
  const [hideRecentId, setHideRecentId] = useState<string | null>(null)
  const [recentsTab, setRecentsTab] = useState<'conversations' | 'journal'>('conversations')

  // local computed messages sourced from store, seed with intro if empty
  const messages: ChatMessage[] = useMemo(() => {
    if (chat && chat.length > 0) return chat
    const intro: ChatMessage = {
      id: 'm1',
      role: 'assistant',
      text: from
        ? `I can see you’d like to continue from conversation ${from}. What would you like to explore today?`
        : 'Welcome back. What’s on your mind today? We can take it gently.',
      time: nowTime(),
      tag: 'Conversation',
    }
    return [intro]
  }, [chat, from])

  // Restore from localStorage (per session)
  useEffect(() => {
    // If store has no chat yet but there was a previous per-route storage, migrate once
    try {
      if (!chat || chat.length === 0) {
        const raw = localStorage.getItem('journal_chat_v1')
        if (raw) {
          const parsed = JSON.parse(raw) as ChatMessage[]
          if (Array.isArray(parsed) && parsed.length > 0) setChat(parsed)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('journal_chat_v1', JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Load hidden recent id from localStorage so dismiss persists
  useEffect(() => {
    try {
      const h = localStorage.getItem('hidden_recent_conversation')
      if (h) setHideRecentId(h)
    } catch {}
  }, [])

  useEffect(() => {
    const node = listRef.current
    if (!node) return
    const behavior: ScrollBehavior = firstRender.current ? 'auto' : 'smooth'
    firstRender.current = false
    node.scrollTo({ top: node.scrollHeight, behavior })
  }, [messages, typing])

  function send(text: string) {
    if (!text.trim()) return
    
    // Call the REAL chat function from socket.ts
    sendChatMessage(text)

    // Clear the input
    setInput('')
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => setSaving(false), 1200)
  }

  // Simple session summary after a few user messages
  const userMsgCount = useMemo(() => messages.filter((m) => m.role === 'user').length, [messages])
  // useEffect(() => {
  //   if (userMsgCount === 3) {
  //     setTyping(true)
  //     setTimeout(() => {
  //       const summary = `From what I’m hearing, a few threads stand out: energy management, small moments of friction, and a desire for gentle structure. Would a tiny next step feel helpful?`
  //       const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: summary, time: nowTime(), tag: 'Conversation' }
  //       const next = [...messages, aiMsg]
  //       setChat(next)
  //       if (speak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
  //         const utt = new SpeechSynthesisUtterance(aiMsg.text)
  //         window.speechSynthesis.cancel()
  //         window.speechSynthesis.speak(utt)
  //       }
  //       setTyping(false)
  //     }, 900)
  //   }
  // }, [userMsgCount, messages, setChat, speak])

  // Voice journal controls using Web Speech API (if available)
  function startVoice() {
    if (typeof window === 'undefined') return
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      setVoiceText('Voice input not supported in this browser.')
      return
    }
    const recog = new SR()
    recog.lang = 'en-US'
    recog.interimResults = true
    recog.continuous = true
    recog.onresult = (e: any) => {
      let t = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        t += e.results[i][0].transcript
      }
      setVoiceText((prev) => (prev ? prev + ' ' : '') + t)
    }
    recog.onend = () => setVoiceActive(false)
    recog.onerror = () => setVoiceActive(false)
    try { recog.start() } catch {}
    recogRef.current = recog
    setVoiceActive(true)
  }

  function stopVoice(saveIt = true) {
    const recog = recogRef.current
    if (recog) {
      try { recog.stop() } catch {}
    }
    setVoiceActive(false)
    if (saveIt && voiceText.trim()) {
      addJournal(voiceText.trim())
      setVoiceText('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {from && (
        <div className="glass-surface p-3 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            <Link2 className="w-4 h-4 text-[var(--accent-500,#8FC8FF)]" />
            Continuing from conversation {from}. <Link href={`/archive/conversation/${from}`} className="underline">Open</Link>
          </div>
          <Link href="/archive" className="text-xs underline text-text-secondary hover:text-text-primary">Change</Link>
        </div>
      )}

      {/* Recent conversation suggestion (no slide) */}
      {!from && (!chat || chat.length === 0) && (() => {
        // pick most recent by date
        const latest = [...archiveConversations].sort((a,b)=> b.date.localeCompare(a.date))[0]
        if (!latest || hideRecentId === latest.id) return null
        return (
          <div className="glass-surface p-3 rounded-xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10">Recent</div>
              <div>
                <div className="font-medium">{latest.title}</div>
                <div className="text-text-secondary text-xs">{latest.date} • {latest.messageCount} messages</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={{ pathname: '/journal', query: { from: latest.id } }} className="px-3 py-1.5 rounded-lg glass neon-edge focus-ring text-xs">Continue</Link>
              <button
                aria-label="Dismiss recent"
                className="w-7 h-7 flex items-center justify-center rounded-md border border-white/10 hover:bg-white/10"
                onClick={() => { try { localStorage.setItem('hidden_recent_conversation', latest.id) } catch {}; setHideRecentId(latest.id); clearChat() }}
              >
                ×
              </button>
            </div>
          </div>
        )
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main panel with modes */}
        <div className="glass-surface rounded-2xl overflow-hidden lg:col-span-2 h-[calc(100vh-180px)] flex flex-col">
          {/* Header with mode selector and controls */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#8FC8FF0f] via-transparent to-[#A78BFA0f] border-b border-white/10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-medium">
                <img src="/brand/clara.png" alt="Clara" className="w-6 h-6 rounded-full" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                <span>Journal & Conversations</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Segmented control */}
                <div role="tablist" aria-label="Journal modes" className="glass rounded-xl p-1 flex items-center gap-1">
                  <button role="tab" aria-selected={mode==='chat'} className={`text-xs px-3 py-1.5 rounded-lg transition ${mode==='chat'?'bg-white/10 shadow-neon':'text-text-secondary hover:bg-white/5'}`} onClick={()=>setMode('chat')}>Chat with Clara</button>
                  <button role="tab" aria-selected={mode==='journal'} className={`text-xs px-3 py-1.5 rounded-lg transition ${mode==='journal'?'bg-white/10 shadow-neon':'text-text-secondary hover:bg-white/5'}`} onClick={()=>setMode('journal')}>Journal</button>
                  <button role="tab" aria-selected={mode==='voice'} className={`text-xs px-3 py-1.5 rounded-lg transition ${mode==='voice'?'bg-white/10 shadow-neon':'text-text-secondary hover:bg-white/5'}`} onClick={()=>setMode('voice')}>Voice journal</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5" onClick={()=>clearChat()}>Delete conversation</button>
                  <a href="/archive" className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 inline-flex items-center gap-1"><Link2 className="w-3.5 h-3.5"/> Continue previous</a>
                  {saving && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#8FC8FF]"><ShieldCheck className="w-4 h-4" /> Saved</span>
                  )}
                  {mode==='chat' && (
                    <label className="hidden sm:flex items-center gap-2 cursor-pointer text-xs">
                      <input type="checkbox" checked={speak} onChange={(e) => setSpeak(e.target.checked)} />
                      <span>Speak replies</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body: conditional by mode */}
          {mode === 'chat' && (
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 flex flex-col justify-end">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {m.role === 'assistant' && (
                      <img src="/brand/clara.png" alt="Clara" className="w-6 h-6 rounded-full mb-0.5" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-white/10 border border-white/10'
                        : 'bg-gradient-to-r from-[var(--acc-blue, #8FC8FF)]/10 to-[var(--acc-violet, #A78BFA)]/10 border border-white/10'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div className="mt-1 text-[10px] text-text-secondary">{m.time}</div>
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="max-w-[60%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-gradient-to-r from-[var(--acc-blue, #8FC8FF)]/10 to-[var(--acc-violet, #A78BFA)]/10 border border-white/10">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'journal' && (
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-sm text-text-secondary mb-2">Write freely. This will be saved as a Journal entry.</div>
              <textarea className="flex-1 glass rounded-xl p-3 bg-transparent" placeholder="Jot your thoughts..." value={input} onChange={(e)=>setInput(e.target.value)} />
              <div className="flex items-center justify-end gap-2 mt-3">
                <Button className="bg-white/10" onClick={()=>setInput('')}>Clear</Button>
                <Button onClick={()=>{ if(input.trim()){ addJournal(input.trim()); setInput('') } }}>Save to Journal</Button>
              </div>
            </div>
          )}

          {mode === 'voice' && (
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-sm text-text-secondary mb-2">Voice journal converts speech to text locally. Save it as a Journal entry.</div>
              <div className="flex items-center gap-2 mb-2">
                {!voiceActive ? (
                  <Button onClick={startVoice}><Mic className="w-4 h-4 mr-1"/> Start recording</Button>
                ) : (
                  <>
                    <Button onClick={()=>stopVoice(true)} className="bg-white/10">Stop & Save</Button>
                    <Button onClick={()=>stopVoice(false)} className="bg-white/10">Stop</Button>
                  </>
                )}
              </div>
              <textarea className="flex-1 glass rounded-xl p-3 bg-transparent" placeholder="Transcription will appear here..." value={voiceText} onChange={(e)=>setVoiceText(e.target.value)} />
              <div className="flex items-center justify-end gap-2 mt-3">
                <Button className="bg-white/10" onClick={()=>setVoiceText('')}>Clear</Button>
                <Button onClick={()=>{ if(voiceText.trim()){ addJournal(voiceText.trim()); setVoiceText('') } }}>Save to Journal</Button>
              </div>
            </div>
          )}

          {/* Composer - only in Chat mode */}
          {mode === 'chat' && (
            <div className="px-3 pb-3">
              <div className="glass p-2 rounded-xl flex items-center gap-2">
                <button className="px-2 py-1 rounded-lg bg-white/5 text-xs hidden sm:inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Prompt</button>
                <button className="px-2 py-1 rounded-lg bg-white/5 text-xs hidden sm:inline-flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> Voice</button>
                <Input
                  placeholder="Type something you'd like to talk about..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-transparent flex-1"
                />
                <Button className="bg-white/10" onClick={() => send(input)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-[11px] text-text-secondary">Kind reminder: take your time, you’re doing great.</div>
                <button className="text-[11px] underline text-text-secondary hover:text-text-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: single panel aligned with chat height */}
        <div className="glass-surface rounded-2xl p-4 h-[calc(100vh-180px)] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Mood</div>
            <div className="text-xs text-text-secondary">Today</div>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, idx) => {
              const val = idx + 1
              const today = new Date().toISOString().slice(0, 10)
              const todayMood = moods.find((m) => m.date === today)?.mood
              const active = todayMood === val
              return (
                <button
                  key={val}
                  onClick={() => addMood(val)}
                  className={`text-xs py-1 rounded-md border border-white/10 ${active ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  {val}
                </button>
              )
            })}
          </div>
          <div className="mt-2 text-[11px] text-text-secondary">
            {(() => {
              const today = new Date().toISOString().slice(0, 10)
              const m = moods.find((x) => x.date === today)
              return m ? `Logged: ${m.mood}/10` : 'No mood logged yet'
            })()}
          </div>

          <div className="flex items-center justify-between mt-4 mb-2">
            <div className="font-medium">Recents</div>
            <a href="/archive" className="text-xs underline text-text-secondary hover:text-text-primary">Open Archive</a>
          </div>
          <div className="glass rounded-xl p-1 inline-flex items-center gap-1 mb-3">
            <button className={`text-xs px-3 py-1.5 rounded-lg transition ${recentsTab==='conversations'?'bg-white/10 shadow-neon':'text-text-secondary hover:bg-white/5'}`} onClick={()=>setRecentsTab('conversations')}>Conversations</button>
            <button className={`text-xs px-3 py-1.5 rounded-lg transition ${recentsTab==='journal'?'bg-white/10 shadow-neon':'text-text-secondary hover:bg-white/5'}`} onClick={()=>setRecentsTab('journal')}>Journal</button>
          </div>

          {recentsTab === 'conversations' && (
            <div className="mt-1 flex-1 flex flex-col gap-2 overflow-y-auto">
              {[...archiveConversations].sort((a,b)=> b.date.localeCompare(a.date)).slice(0,5).map((c) => (
                <div key={c.id} className="glass p-3 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{c.title}</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{c.date} • {c.messageCount} messages</div>
                    </div>
                    <Link href={{ pathname: '/journal', query: { from: c.id } }} className="text-xs px-2 py-1 rounded-lg glass neon-edge focus-ring">Open</Link>
                  </div>
                  {c.tags && c.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.tags.map((t)=> (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {archiveConversations.length === 0 && (
                <div className="text-xs text-text-secondary">No conversations yet.</div>
              )}
            </div>
          )}

          {recentsTab === 'journal' && (
            <div className="mt-1 flex-1 flex flex-col gap-2 overflow-y-auto">
              {[...journal].sort((a,b)=> b.created_at.localeCompare(a.created_at)).slice(0,6).map((j) => (
                <div key={j.id} className="glass p-2 rounded-lg border border-white/10 relative">
                  <button
                    aria-label="Delete journal entry"
                    className="absolute right-2 top-2 w-6 h-6 inline-flex items-center justify-center rounded-md border border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => removeJournal(j.id)}
                  >
                    ×
                  </button>
                  <div className="text-sm pr-7 line-clamp-3 whitespace-pre-wrap">{j.content}</div>
                  <div className="mt-1 text-[10px] text-text-secondary">{new Date(j.created_at).toLocaleString()}</div>
                </div>
              ))}
              {journal.length === 0 && (
                <div className="text-xs text-text-secondary">No journal entries yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JournalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JournalPageClient />
    </Suspense>
  )
}