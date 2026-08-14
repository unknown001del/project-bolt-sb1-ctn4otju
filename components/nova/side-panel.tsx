'use client'

import {
  FileCode2,
  Square,
  Type,
  MousePointerClick,
  Boxes,
  Plus,
  Circle,
  Radio,
} from 'lucide-react'
import { useNova } from '@/lib/nova/store'
import { COLLABORATORS } from '@/lib/nova/initial-data'
import type { CanvasNode } from '@/lib/nova/types'

const FORGE_ITEMS: { tag: CanvasNode['tag']; label: string; icon: typeof Square }[] = [
  { tag: 'section', label: 'Container Frame', icon: Boxes },
  { tag: 'div', label: 'Flex Block', icon: Square },
  { tag: 'h1', label: 'Heading', icon: Type },
  { tag: 'button', label: 'Action Button', icon: MousePointerClick },
]

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="nova-scroll flex-1 overflow-y-auto px-2 pb-3">{children}</div>
    </div>
  )
}

export function SidePanel() {
  const {
    activity,
    files,
    activeFilePath,
    openFile,
    addCanvasNode,
    tables,
    setActivity,
    setMainView,
  } = useNova()

  if (activity === 'files') {
    return (
      <PanelShell title="Code Tree">
        <div className="mb-2 px-1 text-[11px] text-muted-foreground">nova-project</div>
        {files.map((f) => (
          <button
            key={f.path}
            onClick={() => openFile(f.path)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition ${
              activeFilePath === f.path
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/80 hover:bg-secondary'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="truncate font-mono text-xs">{f.path}</span>
          </button>
        ))}
      </PanelShell>
    )
  }

  if (activity === 'forge') {
    return (
      <PanelShell title="Component Forge">
        <p className="mb-3 px-1 text-xs leading-relaxed text-muted-foreground">
          Drop live, AST-backed frames onto the canvas. Each emits clean React + Tailwind into a
          parallel editor tab.
        </p>
        <div className="flex flex-col gap-1.5">
          {FORGE_ITEMS.map(({ tag, label, icon: Icon }) => (
            <button
              key={tag}
              onClick={() => addCanvasNode(tag)}
              className="flex items-center justify-between rounded-md border border-border bg-secondary/50 px-2.5 py-2 text-left text-[13px] transition hover:border-primary/50 hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-nova-cyan" />
                {label}
              </span>
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </PanelShell>
    )
  }

  if (activity === 'collab') {
    return (
      <PanelShell title="Team Nexus">
        <div className="flex flex-col gap-1.5">
          {COLLABORATORS.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2.5 rounded-md border border-border bg-secondary/40 px-2.5 py-2"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-background"
                style={{ background: c.color }}
              >
                {c.name[0]}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">{c.role}</span>
              </div>
              {c.speaking ? (
                <Radio className="ml-auto h-4 w-4 animate-pulse text-nova-cyan" />
              ) : (
                <Circle className="ml-auto h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground">
          Spatial voice + live canvas streaming active. Concurrent cursors are visible in every open
          document.
        </p>
      </PanelShell>
    )
  }

  if (activity === 'database') {
    return (
      <PanelShell title="Database Nexus">
        <div className="flex flex-col gap-1.5">
          {tables.map((t) => (
            <div
              key={t.id}
              className="rounded-md border border-border bg-secondary/40 px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
                <span className="text-[13px] font-semibold">{t.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {t.columns.length} cols
                </span>
              </div>
            </div>
          ))}
        </div>
      </PanelShell>
    )
  }

  // assets / cloud / help — quick launch card
  const labelMap: Record<string, string> = {
    assets: 'Supernova Asset Studio',
    cloud: 'Cloud Matrix',
    help: 'Help Desk',
  }
  return (
    <PanelShell title={labelMap[activity] ?? 'Panel'}>
      <button
        onClick={() => {
          setActivity(activity)
          setMainView('code')
        }}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-secondary/50 px-2.5 py-2 text-left text-[13px] hover:border-primary/50"
      >
        <Boxes className="h-4 w-4 text-nova-cyan" />
        Open in main viewport
      </button>
      <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground">
        This module renders in the Master Production Viewport to the right.
      </p>
    </PanelShell>
  )
}
