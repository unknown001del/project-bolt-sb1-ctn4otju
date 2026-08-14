'use client'

import {
  FolderTree,
  Component,
  Database,
  Users,
  Wand2,
  Cloud,
  LifeBuoy,
} from 'lucide-react'
import type { ActivityId } from '@/lib/nova/types'
import { useNova } from '@/lib/nova/store'

const ITEMS: { id: ActivityId; label: string; icon: typeof FolderTree }[] = [
  { id: 'files', label: 'Code Tree', icon: FolderTree },
  { id: 'forge', label: 'Component Forge', icon: Component },
  { id: 'database', label: 'Database Nexus', icon: Database },
  { id: 'collab', label: 'Collab Terminal', icon: Users },
  { id: 'assets', label: 'Icon Synthesizer', icon: Wand2 },
  { id: 'cloud', label: 'Cloud Matrix', icon: Cloud },
  { id: 'help', label: 'Help Desk', icon: LifeBuoy },
]

export function ActivityBar() {
  const { activity, setActivity } = useNova()
  return (
    <nav className="flex w-14 flex-col items-center gap-1 border-r border-border bg-nova-panel py-3">
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const active = activity === id
        return (
          <button
            key={id}
            onClick={() => setActivity(id)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
              active
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 -translate-x-2 rounded-r bg-primary" style={{ width: 3 }} />
            )}
            <Icon className="h-5 w-5" />
          </button>
        )
      })}
    </nav>
  )
}
