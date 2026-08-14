'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNova } from '@/lib/nova/store'
import { INITIAL_CURSORS } from '@/lib/nova/initial-data'
import type { TeammateCursor } from '@/lib/nova/types'

const LINE_H = 20
const CHAR_W = 7.7
const PAD_Y = 12
const GUTTER = 52

export function CodeEditor() {
  const { activeFile, updateFileContent, consumeOp } = useNova()
  const [cursors, setCursors] = useState<TeammateCursor[]>(INITIAL_CURSORS)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const lines = useMemo(() => (activeFile?.content ?? '').split('\n'), [activeFile?.content])

  // animate teammate cursors across the document
  useEffect(() => {
    const total = lines.length
    const id = setInterval(() => {
      setCursors((prev) =>
        prev.map((c) => {
          const line = Math.min(total - 1, Math.max(0, c.line + (Math.random() > 0.5 ? 1 : -1)))
          const len = lines[line]?.length ?? 0
          const ch = Math.max(0, Math.min(len, Math.floor(Math.random() * (len + 4))))
          return { ...c, line, ch }
        }),
      )
    }, 1600)
    return () => clearInterval(id)
  }, [lines])

  const syncScroll = () => {
    if (taRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop
    }
  }

  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No file open — pick one from the Code Tree.
      </div>
    )
  }

  return (
    <div className="relative flex h-full overflow-hidden bg-nova-panel font-mono text-[13px]">
      {/* gutter */}
      <div
        ref={gutterRef}
        className="nova-scroll shrink-0 select-none overflow-hidden border-r border-border bg-nova-panel py-3 text-right text-muted-foreground/60"
        style={{ width: GUTTER }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ height: LINE_H, lineHeight: `${LINE_H}px` }} className="pr-3">
            {i + 1}
          </div>
        ))}
      </div>

      {/* editor surface */}
      <div className="relative flex-1 overflow-hidden">
        <textarea
          ref={taRef}
          spellCheck={false}
          value={activeFile.content}
          onScroll={syncScroll}
          onChange={(e) => {
            if (!consumeOp('editor keystroke')) return
            updateFileContent(activeFile.path, e.target.value)
          }}
          className="nova-scroll absolute inset-0 h-full w-full resize-none bg-transparent px-4 py-3 leading-5 text-foreground caret-primary outline-none"
          style={{ lineHeight: `${LINE_H}px`, tabSize: 2 }}
        />

        {/* teammate cursors overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {cursors.map((c) => (
            <div
              key={c.id}
              className="absolute transition-all duration-700 ease-out"
              style={{
                top: c.line * LINE_H + PAD_Y,
                left: c.ch * CHAR_W + 16,
              }}
            >
              <div className="animate-nova-blink" style={{ width: 2, height: LINE_H, background: c.color }} />
              <div
                className="absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-background"
                style={{ background: c.color }}
              >
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
