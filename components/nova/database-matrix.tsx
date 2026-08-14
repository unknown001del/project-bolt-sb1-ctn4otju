'use client'

import { useRef } from 'react'
import { KeyRound, Link2, RefreshCw } from 'lucide-react'
import { useNova } from '@/lib/nova/store'
import type { DbTable } from '@/lib/nova/types'

const CARD_W = 200

export function DatabaseMatrix() {
  const { tables, moveTable, syncSchema } = useNova()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent, t: DbTable) => {
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = { id: t.id, dx: e.clientX - rect.left - t.x, dy: e.clientY - rect.top - t.y }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  const onMove = (e: PointerEvent) => {
    const d = dragRef.current
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!d || !rect) return
    moveTable(
      d.id,
      Math.max(0, Math.min(rect.width - CARD_W, e.clientX - rect.left - d.dx)),
      Math.max(0, Math.min(rect.height - 60, e.clientY - rect.top - d.dy)),
    )
  }
  const onUp = () => {
    dragRef.current = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  const byId = Object.fromEntries(tables.map((t) => [t.id, t]))

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-3 border-b border-border px-4">
        <span className="text-sm font-semibold">Relational Database Matrix</span>
        <span className="text-xs text-muted-foreground">Drag entities · links map foreign keys</span>
        <button
          onClick={syncSchema}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:brightness-110"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Drizzle schema
        </button>
      </div>

      <div ref={surfaceRef} className="nova-grid relative flex-1 overflow-hidden bg-nova-panel">
        {/* relation links */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {tables.flatMap((t) =>
            t.columns
              .filter((c) => c.fk && byId[c.fk])
              .map((c) => {
                const target = byId[c.fk as string]
                const x1 = t.x + CARD_W / 2
                const y1 = t.y + 24
                const x2 = target.x + CARD_W / 2
                const y2 = target.y + 24
                const mx = (x1 + x2) / 2
                return (
                  <g key={`${t.id}-${c.name}`}>
                    <path
                      d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                      stroke={t.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                      opacity="0.7"
                    />
                    <circle cx={x2} cy={y2} r="3" fill={target.color} />
                  </g>
                )
              }),
          )}
        </svg>

        {tables.map((t) => (
          <div
            key={t.id}
            onPointerDown={(e) => onPointerDown(e, t)}
            className="absolute cursor-grab overflow-hidden rounded-lg border border-border bg-card shadow-lg active:cursor-grabbing"
            style={{ left: t.x, top: t.y, width: CARD_W }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-background"
              style={{ background: t.color }}
            >
              {t.name}
            </div>
            <div className="divide-y divide-border">
              {t.columns.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-2 px-3 py-1.5 font-mono text-[11px]"
                >
                  {c.pk ? (
                    <KeyRound className="h-3 w-3 text-primary" />
                  ) : c.fk ? (
                    <Link2 className="h-3 w-3 text-nova-cyan" />
                  ) : (
                    <span className="h-3 w-3" />
                  )}
                  <span className="text-foreground/90">{c.name}</span>
                  <span className="ml-auto text-muted-foreground">{c.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
