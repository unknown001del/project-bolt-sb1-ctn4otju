'use client'

import { History, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useNova } from '@/lib/nova/store'

export function TimeTravel() {
  const { history, historyIndex, scrubHistory } = useNova()
  const max = history.length - 1
  const current = history[historyIndex]

  const relative = (ts: number) => {
    const s = Math.round((Date.now() - ts) / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.round(s / 60)
    if (m < 60) return `${m}m ago`
    return `${Math.round(m / 60)}h ago`
  }

  return (
    <div className="flex h-10 items-center gap-3 border-t border-border bg-nova-panel px-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <History className="h-3.5 w-3.5 text-nova-cyan" />
        Time-Travel
      </div>

      <button
        onClick={() => scrubHistory(Math.max(0, historyIndex - 1))}
        disabled={historyIndex <= 0}
        className="rounded p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30"
        aria-label="Step back"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <input
        type="range"
        min={0}
        max={Math.max(0, max)}
        value={historyIndex}
        onChange={(e) => scrubHistory(Number(e.target.value))}
        className="nova-range h-1.5 flex-1 cursor-pointer"
        aria-label="Scrub workspace history"
      />

      <button
        onClick={() => scrubHistory(Math.min(max, historyIndex + 1))}
        disabled={historyIndex >= max}
        className="rounded p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30"
        aria-label="Step forward"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
        <span className="truncate text-[11px] text-foreground/80" title={current?.label}>
          {current?.label ?? 'Genesis'}
        </span>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {current ? relative(current.ts) : ''}
        </span>
      </div>

      <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {historyIndex + 1}/{history.length}
      </span>

      {historyIndex < max && (
        <button
          onClick={() => scrubHistory(max)}
          className="flex shrink-0 items-center gap-1 rounded-md border border-nova-cyan/40 bg-nova-cyan/10 px-2 py-1 text-[10.5px] font-semibold text-nova-cyan transition hover:bg-nova-cyan/20"
        >
          <RotateCcw className="h-3 w-3" /> Latest
        </button>
      )}
    </div>
  )
}
