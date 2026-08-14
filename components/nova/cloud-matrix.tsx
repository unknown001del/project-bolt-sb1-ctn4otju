'use client'

import { useState } from 'react'
import { Cloud, Loader2, Check, ExternalLink, Rocket, Server, Database, Globe } from 'lucide-react'
import { useNova } from '@/lib/nova/store'

const STEPS = [
  { id: 'build', label: 'Compiling production bundle', icon: Rocket },
  { id: 'provision', label: 'Provisioning serverless functions', icon: Server },
  { id: 'db', label: 'Syncing database branch', icon: Database },
  { id: 'edge', label: 'Distributing to global edge', icon: Globe },
]

type Status = 'idle' | 'running' | 'done'

export function CloudMatrix() {
  const { pushTerminal, consumeOp, user } = useNova()
  const [status, setStatus] = useState<Status>('idle')
  const [active, setActive] = useState(-1)
  const url = `https://${user?.alias?.toLowerCase().replace(/\s+/g, '-') || 'nova'}.nova.dev`

  const deploy = () => {
    if (status === 'running') return
    if (!consumeOp('cloud: 1-click deploy')) return
    setStatus('running')
    setActive(0)
    pushTerminal('command', 'nova deploy --prod')
    STEPS.forEach((s, i) => {
      setTimeout(() => {
        setActive(i)
        pushTerminal('stdout', `orchestrator: ${s.label} …`)
      }, i * 900)
      setTimeout(() => {
        if (i === STEPS.length - 1) {
          setStatus('done')
          setActive(STEPS.length)
          pushTerminal('success', `✓ deployment live → ${url}`)
        }
      }, (i + 1) * 900)
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-border px-4">
        <Cloud className="h-4 w-4 text-nova-cyan" />
        <span className="text-sm font-semibold">1-Click Cloud Orchestrator</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 nova-glass">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Deploy Nova Workspace</h3>
              <p className="text-xs text-muted-foreground">
                Target: {user?.cloud ?? 'Vercel Edge'} · region auto
              </p>
            </div>
            <button
              onClick={deploy}
              disabled={status === 'running'}
              className="flex items-center gap-2 rounded-md bg-gradient-to-r from-primary to-[#ff8a2b] px-4 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {status === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {status === 'done' ? 'Redeploy' : 'Deploy'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {STEPS.map((s, i) => {
              const state = active > i || status === 'done' ? 'done' : active === i && status === 'running' ? 'running' : 'idle'
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                    state === 'idle'
                      ? 'border-border bg-secondary/30 text-muted-foreground'
                      : 'border-primary/30 bg-primary/5 text-foreground'
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="text-[13px]">{s.label}</span>
                  <span className="ml-auto">
                    {state === 'done' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : state === 'running' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : null}
                  </span>
                </div>
              )
            })}
          </div>

          {status === 'done' && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-md border border-nova-cyan/40 bg-nova-cyan/10 px-4 py-2.5 text-sm font-semibold text-nova-cyan transition hover:bg-nova-cyan/20"
            >
              <ExternalLink className="h-4 w-4" />
              {url}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
