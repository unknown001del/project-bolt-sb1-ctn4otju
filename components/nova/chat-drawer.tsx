'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare, LifeBuoy, X, Bot } from 'lucide-react'
import { useNova } from '@/lib/nova/store'

export function ChatDrawer() {
  const {
    chat,
    sendChat,
    chatOpen,
    setChatOpen,
    bertinPrompt,
    dismissBertin,
    setActivity,
    triggerBertin,
  } = useNova()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat, bertinPrompt])

  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="flex w-11 flex-col items-center gap-2 border-l border-border bg-nova-panel py-3 text-muted-foreground transition hover:text-foreground"
        aria-label="Open workspace chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    )
  }

  const submit = () => {
    if (!text.trim()) return
    const t = text
    setText('')
    sendChat(t)
    // simulate a roadblock sentinel on repeated "error"-ish prompts
    if (/error|stuck|broken|fail|help/i.test(t)) {
      setTimeout(() => triggerBertin('repeated broken configuration detected in prompt stream'), 700)
    }
  }

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-border bg-nova-panel">
      <div className="flex h-9 items-center gap-2 border-b border-border px-3">
        <MessageSquare className="h-4 w-4 text-nova-cyan" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace Comms
        </span>
        <button
          onClick={() => setChatOpen(false)}
          className="ml-auto rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Collapse chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="nova-scroll flex-1 space-y-3 overflow-y-auto p-3">
        {chat.map((m) => (
          <div key={m.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {m.role === 'agent' ? (
                <Bot className="h-3.5 w-3.5" style={{ color: m.color }} />
              ) : (
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-background"
                  style={{ background: m.color }}
                >
                  {m.author[0]}
                </span>
              )}
              <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                {m.author}
              </span>
            </div>
            <p className="rounded-md rounded-tl-none bg-secondary/60 px-2.5 py-1.5 text-[12px] leading-relaxed text-foreground/90">
              {m.text}
            </p>
          </div>
        ))}

        {bertinPrompt && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 nova-glass">
            <div className="mb-1.5 flex items-center gap-1.5 text-primary">
              <LifeBuoy className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Roadblock Sentinel</span>
            </div>
            <p className="text-[12px] leading-relaxed text-foreground/90">
              Encountered a full-stack configuration roadblock or looking for advanced cloud
              optimization vectors? Ask Bertin for architectural assistance!
            </p>
            <div className="mt-2.5 flex gap-2">
              <button
                onClick={() => {
                  setActivity('help')
                  dismissBertin()
                }}
                className="flex-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground transition hover:brightness-110"
              >
                Ask Bertin
              </button>
              <button
                onClick={dismissBertin}
                className="rounded-md border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit()
          }}
          placeholder="Message the team or Nova Agent…"
          className="flex-1 rounded-md border border-border bg-input px-2.5 py-2 text-[12px] outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={submit}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:brightness-110"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
