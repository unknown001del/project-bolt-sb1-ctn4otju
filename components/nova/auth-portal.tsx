'use client'

import { useState } from 'react'
import { X, Crown, ChevronRight } from 'lucide-react'
import { NovaLogo } from './nova-logo'
import { useNova } from '@/lib/nova/store'

const CLOUDS = ['Vercel Edge', 'AWS Lambda', 'Cloudflare Workers', 'Fly.io']
const DBS = ['Drizzle + Neon', 'Prisma + Postgres', 'Supabase', 'PlanetScale']

export function AuthPortal() {
  const { authOpen, setAuthOpen, signIn, guestOpsUsed, guestLimit, user } = useNova()
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [alias, setAlias] = useState('')
  const [cloud, setCloud] = useState(CLOUDS[0])
  const [db, setDb] = useState(DBS[0])

  if (!authOpen) return null

  const quotaHit = !user && guestOpsUsed >= guestLimit

  const submit = () => {
    signIn({ alias: alias.trim() || 'Creator', cloud, dbFramework: db })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={() => setAuthOpen(false)}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-2xl nova-glass">
        <button
          onClick={() => setAuthOpen(false)}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <NovaLogo size={40} />
          <div>
            <h2 className="text-lg font-bold tracking-wide">
              {mode === 'signup' ? 'Create your console' : 'Welcome back'}
            </h2>
            <p className="text-xs text-muted-foreground">Nova Sovereign Ecosystem</p>
          </div>
        </div>

        {quotaHit && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3">
            <Crown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-[12px] leading-relaxed text-foreground/90">
              You&apos;ve used all {guestLimit} guest operations. Authorize now to permanently unlock{' '}
              <span className="font-bold text-primary">Legendary Creator Level</span> — unlimited
              global tools, free forever.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Developer alias
            </span>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. nova-architect"
              className="rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Cloud vendor target
            </span>
            <select
              value={cloud}
              onChange={(e) => setCloud(e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {CLOUDS.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Database framework
            </span>
            <select
              value={db}
              onChange={(e) => setDb(e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {DBS.map((d) => (
                <option key={d} value={d} className="bg-card">
                  {d}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={submit}
            className="mt-1 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary to-[#ff8a2b] px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            {mode === 'signup' ? 'Create console & unlock tools' : 'Sign in'}
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-center text-xs text-muted-foreground transition hover:text-foreground"
          >
            {mode === 'signup'
              ? 'Already have a console? Sign in'
              : "New here? Create a console"}
          </button>
        </div>
      </div>
    </div>
  )
}
