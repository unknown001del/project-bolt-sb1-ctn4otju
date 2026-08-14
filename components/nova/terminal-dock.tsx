'use client'

import { useEffect, useRef, useState } from 'react'
import { TerminalSquare, Play, Hammer, GitBranch, ChevronDown } from 'lucide-react'
import { useNova } from '@/lib/nova/store'
import type { TerminalLine } from '@/lib/nova/types'

const STREAM_COLOR: Record<TerminalLine['stream'], string> = {
  system: 'text-muted-foreground',
  stdout: 'text-foreground/80',
  success: 'text-emerald-400',
  error: 'text-destructive',
  command: 'text-nova-cyan',
}

export function TerminalDock({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { terminal, runCommand, pushTerminal } = useNova()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [terminal])

  const submit = () => {
    if (!input.trim()) return
    const cmd = input.trim()
    setInput('')
    if (cmd.startsWith('npm') || cmd.startsWith('git') || cmd.startsWith('pnpm')) {
      runCommand(cmd)
    } else {
      pushTerminal('command', `nova@obsidian:~/project$ ${cmd}`)
      pushTerminal('stdout', `command not found in kernel simulation: ${cmd}`)
    }
  }

  return (
    <div className="flex flex-col border-t border-border bg-nova-panel">
      <div className="flex h-9 items-center gap-2 px-3">
        <TerminalSquare className="h-4 w-4 text-nova-cyan" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Telemetry Dock — Kernel
        </span>
        <div className="ml-3 flex items-center gap-1.5">
          <CmdBtn icon={Play} label="npm run dev" onClick={() => runCommand('npm run dev')} />
          <CmdBtn icon={Hammer} label="npm run build" onClick={() => runCommand('npm run build')} />
          <CmdBtn icon={GitBranch} label="git push" onClick={() => runCommand('git push origin main')} />
        </div>
        <button
          onClick={onToggle}
          className="ml-auto rounded p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? 'Expand terminal' : 'Collapse terminal'}
        >
          <ChevronDown className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {!collapsed && (
        <>
          <div
            ref={scrollRef}
            className="nova-scroll h-40 overflow-y-auto px-3 pb-2 font-mono text-[12px] leading-5"
          >
            {terminal.map((l) => (
              <div key={l.id} className={STREAM_COLOR[l.stream]}>
                {l.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border px-3 py-1.5 font-mono text-[12px]">
            <span className="text-nova-cyan">nova@obsidian</span>
            <span className="text-muted-foreground">~/project $</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit()
              }}
              placeholder="try: npm run dev"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </>
      )}
    </div>
  )
}

function CmdBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Play
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded border border-border bg-secondary/60 px-2 py-1 text-[11px] font-medium transition hover:border-primary/40 hover:text-primary"
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  )
}
