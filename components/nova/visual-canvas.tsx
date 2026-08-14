'use client'

import { useRef } from 'react'
import { Trash2, Rows3, Columns3, Layout } from 'lucide-react'
import { useNova } from '@/lib/nova/store'
import type { CanvasNode } from '@/lib/nova/types'

export function VisualCanvas() {
  const {
    canvasNodes,
    selectedNode,
    selectNode,
    updateNode,
    deleteNode,
    addCanvasNode,
  } = useNova()
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)

  const onPointerDown = (e: React.PointerEvent, node: CanvasNode) => {
    e.stopPropagation()
    selectNode(node.id)
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = {
      id: node.id,
      dx: e.clientX - rect.left - node.x,
      dy: e.clientY - rect.top - node.y,
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onMove = (e: PointerEvent) => {
    const d = dragRef.current
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!d || !rect) return
    const x = Math.max(0, Math.min(rect.width - 40, e.clientX - rect.left - d.dx))
    const y = Math.max(0, Math.min(rect.height - 20, e.clientY - rect.top - d.dy))
    updateNode(d.id, { x, y })
  }

  const onUp = () => {
    dragRef.current = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  return (
    <div className="flex h-full">
      {/* canvas surface */}
      <div
        ref={surfaceRef}
        onPointerDown={() => selectNode(null)}
        className="nova-grid relative flex-1 overflow-hidden bg-nova-panel"
      >
        {canvasNodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Layout className="h-8 w-8 opacity-40" />
            <p>Empty AST viewport.</p>
            <p className="text-xs">Add frames from the Component Forge to live-compile React.</p>
          </div>
        )}
        {canvasNodes.map((n) => {
          const selected = selectedNode?.id === n.id
          const Tag = n.tag as any
          return (
            <div
              key={n.id}
              onPointerDown={(e) => onPointerDown(e, n)}
              className={`absolute cursor-grab active:cursor-grabbing ${
                selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-nova-panel' : ''
              }`}
              style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
            >
              <Tag
                className="flex h-full w-full items-center justify-center overflow-hidden text-center text-sm font-medium"
                style={{
                  background: n.bg,
                  color: n.color,
                  borderRadius: n.radius,
                  padding: n.padding,
                  flexDirection: n.direction === 'col' ? 'column' : 'row',
                }}
              >
                {n.text || n.label}
              </Tag>
              {selected && (
                <span className="absolute -top-5 left-0 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {'<'}{n.tag}{'>'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* styling inspector */}
      <aside className="w-64 shrink-0 border-l border-border bg-nova-panel">
        <div className="flex h-9 items-center px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Style Inspector
        </div>
        {selectedNode ? (
          <div className="nova-scroll flex flex-col gap-4 overflow-y-auto p-3 text-xs">
            <Field label="Text">
              <input
                value={selectedNode.text}
                onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                className="w-full rounded-md border border-border bg-input px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Width">
                <NumberInput
                  value={selectedNode.w}
                  onChange={(v) => updateNode(selectedNode.id, { w: v })}
                />
              </Field>
              <Field label="Height">
                <NumberInput
                  value={selectedNode.h}
                  onChange={(v) => updateNode(selectedNode.id, { h: v })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Padding">
                <NumberInput
                  value={selectedNode.padding}
                  onChange={(v) => updateNode(selectedNode.id, { padding: v })}
                />
              </Field>
              <Field label="Radius">
                <NumberInput
                  value={selectedNode.radius}
                  onChange={(v) => updateNode(selectedNode.id, { radius: v })}
                />
              </Field>
            </div>

            <Field label="Direction">
              <div className="flex gap-1">
                <ToggleBtn
                  active={selectedNode.direction === 'row'}
                  onClick={() => updateNode(selectedNode.id, { direction: 'row' })}
                >
                  <Columns3 className="h-3.5 w-3.5" /> Row
                </ToggleBtn>
                <ToggleBtn
                  active={selectedNode.direction === 'col'}
                  onClick={() => updateNode(selectedNode.id, { direction: 'col' })}
                >
                  <Rows3 className="h-3.5 w-3.5" /> Col
                </ToggleBtn>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Background">
                <ColorInput
                  value={selectedNode.bg}
                  onChange={(v) => updateNode(selectedNode.id, { bg: v })}
                />
              </Field>
              <Field label="Text color">
                <ColorInput
                  value={selectedNode.color}
                  onChange={(v) => updateNode(selectedNode.id, { color: v })}
                />
              </Field>
            </div>

            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="mt-1 flex items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive transition hover:bg-destructive/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete frame
            </button>
          </div>
        ) : (
          <div className="p-3 text-xs leading-relaxed text-muted-foreground">
            Select a frame to edit layout, spacing, and composite styles. Changes recompile the
            editor tab in real time.
            <button
              onClick={() => addCanvasNode('section')}
              className="mt-3 w-full rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-primary hover:bg-primary/20"
            >
              + Add container frame
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-full rounded-md border border-border bg-input px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
    />
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-input px-1.5 py-1">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 shrink-0 cursor-pointer rounded bg-transparent"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent font-mono text-[11px] outline-none"
      />
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 transition ${
        active
          ? 'border-primary/50 bg-primary/15 text-primary'
          : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
