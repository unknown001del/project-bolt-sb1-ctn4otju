'use client'

import { useEffect, useRef, useState } from 'react'
import { LifeBuoy, Send, Sparkles } from 'lucide-react'

type Msg = { id: number; from: 'you' | 'bertin'; text: string }

const TOPICS = [
  'My build fails with a type error across files',
  'Optimize cold starts on serverless functions',
  'Design a multi-tenant database schema',
  'Wire real-time collaboration cursors',
]

const REPLIES: Record<string, string> = {
  default:
    'Let me trace the dependency graph. I recommend isolating the failing module, regenerating its type definitions, then letting the self-heal engine propagate imports across the tree. Want me to open the affected files?',
}

let mid = 0

export function HelpDesk() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: mid++,
      from: 'bertin',
      text: "I'm Bertin — your architectural co-pilot. Describe the roadblock, or pick a topic below and I'll map an optimization vector.",
    },
  ])
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const ask = (q: string) => {
    if (!q.trim()) return
    setMessages((m) => [...m, { id: mid++, from: 'you', text: q }])
    setText('')
    setTimeout(() => {
      setMessages((m) => [...m, { id: mid++, from: 'bertin', text: REPLIES.default }])
    }, 700)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-border px-4">
        <LifeBuoy className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Help Desk — Ask Bertin</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="h-3 w-3" /> Architect Online
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden p-4">
        <div ref={scrollRef} className="nova-scroll flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                  m.from === 'you'
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm border border-border bg-card text-foreground/90'
                }`}
              >
                {m.from === 'bertin' && (
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-nova-cyan">
                    <LifeBuoy className="h-3.5 w-3.5" /> Bertin
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => ask(t)}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-[11px] text-foreground/80 transition hover:border-primary/40 hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-input p-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) ask(text)
            }}
            placeholder="Describe your full-stack roadblock…"
            className="flex-1 bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
          />
          <button
            onClick={() => ask(text)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:brightness-110"
            aria-label="Send to Bertin"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
