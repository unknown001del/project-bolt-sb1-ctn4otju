'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Send,
  X,
  ListChecks,
  Database,
  LayoutTemplate,
  Flame,
  Check,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { useNova } from '@/lib/nova/store'

const IDEA_CHIPS = [
  'A commerce store with multi-currency checkout',
  'A social feed with posts and follows',
  'A kanban task board for my team',
  'A booking app for appointments',
]

export function BertinBlueprint() {
  const {
    blueprintOpen,
    blueprintPhase,
    blueprintPlan,
    blueprintChat,
    submitBlueprintPrompt,
    refineBlueprint,
    toggleArchitectureItem,
    igniteCompiler,
    closeBlueprint,
  } = useNova()

  const [prompt, setPrompt] = useState('')
  const [refine, setRefine] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [blueprintChat])

  if (!blueprintOpen) return null

  const thinking = blueprintPhase === 'thinking'
  const igniting = blueprintPhase === 'igniting'
  const hasPlan = !!blueprintPlan && (blueprintPhase === 'ready' || igniting)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-md md:p-6">
      <div className="nova-glass relative flex h-full max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-primary/25 bg-nova-panel/90 shadow-2xl">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          <BertinAvatar active={thinking || igniting} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide">Bertin — Principal Systems Architect</span>
            <span className="text-[11px] text-nova-cyan">
              {igniting
                ? 'Igniting Nova Compiler…'
                : thinking
                  ? 'Decomposing your idea into a build plan…'
                  : 'Bertin Blueprint Space · plan before you compile'}
            </span>
          </div>
          <button
            onClick={closeBlueprint}
            className="ml-auto rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close Blueprint Space"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* body: split screen */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1.15fr_1fr]">
          {/* LEFT — conversation with Bertin */}
          <div className="flex min-h-0 flex-col border-b border-border md:border-b-0 md:border-r">
            <div ref={chatRef} className="nova-scroll flex-1 space-y-4 overflow-y-auto p-5">
              {blueprintChat.length === 0 && !hasPlan && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <BertinAvatar small />
                    <p className="max-w-md rounded-xl rounded-tl-none bg-secondary/60 px-3.5 py-2.5 text-[13px] leading-relaxed">
                      Hey — I&apos;m Bertin. Before Nova writes a single file, let&apos;s map your idea
                      into a clean architecture. Describe what you want to build in plain language.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-11">
                    {IDEA_CHIPS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setPrompt(c)
                          submitBlueprintPrompt(c)
                        }}
                        className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-[12px] text-foreground/80 transition hover:border-primary/50 hover:text-foreground"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {blueprintChat.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === 'you' ? 'flex-row-reverse' : ''}`}
                >
                  {m.role === 'you' ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
                      {m.author[0]}
                    </span>
                  ) : (
                    <BertinAvatar small />
                  )}
                  <p
                    className={`max-w-md px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === 'you'
                        ? 'rounded-xl rounded-tr-none bg-primary/15 text-foreground'
                        : 'rounded-xl rounded-tl-none bg-secondary/60'
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}

              {thinking && (
                <div className="flex items-center gap-2 pl-11 text-[12px] text-nova-cyan">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  mapping architecture, schemas & wireframes…
                </div>
              )}
            </div>

            {/* input */}
            <div className="border-t border-border p-3">
              {!hasPlan ? (
                <div className="flex items-end gap-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault()
                        submitBlueprintPrompt(prompt)
                      }
                    }}
                    rows={2}
                    placeholder="Describe your app idea… e.g. 'a store that sells prints with multi-currency checkout'"
                    className="nova-scroll flex-1 resize-none rounded-lg border border-border bg-input px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => submitBlueprintPrompt(prompt)}
                    disabled={!prompt.trim() || thinking}
                    className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
                  >
                    Plan <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={refine}
                    onChange={(e) => setRefine(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        refineBlueprint(refine)
                        setRefine('')
                      }
                    }}
                    placeholder="Refine the plan with Bertin… (e.g. 'add Stripe subscriptions')"
                    className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => {
                      refineBlueprint(refine)
                      setRefine('')
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground transition hover:bg-secondary/70"
                    aria-label="Send refinement"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — the plan */}
          <div className="nova-scroll min-h-0 overflow-y-auto p-5">
            {!hasPlan ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <LayoutTemplate className="h-10 w-10 opacity-40" />
                <p className="max-w-xs text-[13px] leading-relaxed">
                  Your structured blueprint — architecture checklist, database schemas, and screen
                  wireframes — will materialize here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-[13px] leading-relaxed text-foreground/85">
                  {blueprintPlan!.summary}
                </p>

                {/* architecture checklist */}
                <Section icon={ListChecks} title="App Architecture Checklist">
                  <div className="space-y-1.5">
                    {blueprintPlan!.architecture.map((a, i) => (
                      <button
                        key={a.label}
                        onClick={() => toggleArchitectureItem(i)}
                        className="flex w-full items-start gap-2.5 rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-left transition hover:border-primary/40"
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            a.done
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/50'
                          }`}
                        >
                          {a.done && <Check className="h-3 w-3" />}
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-[13px] font-medium">{a.label}</span>
                          <span className="text-[11px] text-muted-foreground">{a.detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>

                {/* schemas */}
                <Section icon={Database} title="Recommended Database Schemas">
                  <div className="space-y-2">
                    {blueprintPlan!.schemas.map((s) => (
                      <div key={s.table} className="rounded-md border border-border bg-secondary/40 p-2.5">
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-sm bg-nova-cyan" />
                          <span className="font-mono text-[12px] font-semibold text-nova-cyan">
                            {s.table}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {s.columns.map((c) => (
                            <span
                              key={c}
                              className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* wireframes */}
                <Section icon={LayoutTemplate} title="Visual Layout Wireframes">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {blueprintPlan!.wireframes.map((w) => (
                      <div key={w.screen} className="rounded-md border border-border bg-secondary/40 p-2">
                        <div className="mb-1.5 text-[11px] font-semibold text-foreground/80">
                          {w.screen}
                        </div>
                        <div className="space-y-1">
                          {w.blocks.map((b, i) => (
                            <div
                              key={b}
                              className="rounded-sm bg-background/70 px-1.5 py-1 text-[10px] text-muted-foreground"
                              style={{ opacity: 1 - i * 0.12 }}
                            >
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>

        {/* ignite footer */}
        {hasPlan && (
          <div className="border-t border-border bg-background/50 p-3">
            <button
              onClick={igniteCompiler}
              disabled={igniting}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#ff8a2b] py-3.5 text-[15px] font-extrabold tracking-wide text-primary-foreground shadow-[0_0_30px_-4px_var(--nova-amber)] transition hover:brightness-110 disabled:opacity-70"
            >
              {igniting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Igniting Nova Compiler…
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5" /> Approve &amp; Ignite Nova Compiler
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ListChecks
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function BertinAvatar({ active, small }: { active?: boolean; small?: boolean }) {
  const s = small ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <div
      className={`relative flex ${s} shrink-0 items-center justify-center rounded-xl border border-nova-cyan/40 bg-gradient-to-br from-nova-cyan/20 to-primary/20`}
    >
      <Sparkles className={`${small ? 'h-4 w-4' : 'h-5 w-5'} text-nova-cyan`} />
      {active && (
        <span className="absolute inset-0 animate-nova-pulse rounded-xl ring-2 ring-nova-cyan/50" />
      )}
    </div>
  )
}
