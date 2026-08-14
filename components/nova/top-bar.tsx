'use client'

import { HardDrive, Rocket, Sparkles, Crown, LogIn } from 'lucide-react'
import { NovaLogo } from './nova-logo'
import { useNova } from '@/lib/nova/store'
import { COLLABORATORS } from '@/lib/nova/initial-data'

export function TopBar({ onDeploy }: { onDeploy: () => void }) {
  const {
    user,
    guestOpsUsed,
    guestLimit,
    mirrored,
    mirrorRoot,
    mirrorLocalDisk,
    setAuthOpen,
  } = useNova()

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-nova-panel px-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <NovaLogo size={30} />
          <span className="text-lg font-bold tracking-[0.18em] text-glow-amber">NOVA</span>
        </div>
        <span className="ml-1 hidden rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:inline">
          Cryo-Obsidian
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* mirror disk */}
        <button
          onClick={() => void mirrorLocalDisk()}
          className={`group relative flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
            mirrored
              ? 'border-nova-cyan/40 bg-nova-cyan/10 text-nova-cyan'
              : 'animate-nova-pulse border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          {mirrored ? `Mirroring /${mirrorRoot}` : 'Mirror Local Hard Drive'}
        </button>

        {/* deploy */}
        <button
          onClick={onDeploy}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-primary to-[#ff8a2b] px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:brightness-110"
        >
          <Rocket className="h-3.5 w-3.5" />
          Deploy
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* presence cluster */}
        <div className="hidden items-center sm:flex">
          {COLLABORATORS.map((c, i) => (
            <div
              key={c.id}
              className="relative -ml-2 first:ml-0"
              style={{ zIndex: COLLABORATORS.length - i }}
              title={`${c.name} — ${c.role}`}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-nova-panel text-[11px] font-bold text-background"
                style={{ background: c.color }}
              >
                {c.name[0]}
              </div>
              {c.speaking && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-nova-panel"
                  style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {/* account */}
        {user ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-2.5 py-1.5">
            {user.legendary ? (
              <Crown className="h-4 w-4 text-primary" />
            ) : (
              <Sparkles className="h-4 w-4 text-nova-cyan" />
            )}
            <div className="flex flex-col leading-none">
              <span className="text-xs font-semibold">{user.alias}</span>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                {user.legendary ? 'Legendary Creator' : user.cloud}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold transition hover:border-primary/50"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>
              Guest{' '}
              <span className="text-muted-foreground">
                {guestOpsUsed}/{guestLimit}
              </span>
            </span>
          </button>
        )}
      </div>
    </header>
  )
}
