'use client'

import { Smartphone, Wifi, BatteryFull, Signal } from 'lucide-react'
import { useNova } from '@/lib/nova/store'

function AppScreen({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide" style={{ color: accent }}>
            NOVA
          </span>
          <span className="h-7 w-7 rounded-full bg-secondary" />
        </div>
        <div
          className="rounded-xl p-3.5"
          style={{ background: `linear-gradient(135deg, ${accent}, #ff8a2b)` }}
        >
          <p className="text-[11px] font-semibold text-background/90">Welcome back, Creator</p>
          <p className="mt-1 text-lg font-extrabold text-background">Ship from anywhere</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4">
        {['Deploys', 'Schemas', 'Assets', 'Team'].map((t) => (
          <div key={t} className="rounded-lg border border-border bg-secondary/50 p-3">
            <div className="mb-2 h-6 w-6 rounded-md" style={{ background: `${accent}33` }} />
            <span className="text-[11px] font-medium">{t}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-around border-t border-border px-4 py-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-6 w-6 rounded-md"
            style={{ background: i === 0 ? accent : 'var(--secondary)' }}
          />
        ))}
      </div>
    </div>
  )
}

function StatusBar({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-foreground/80">
      <span>{label}</span>
      <span className="flex items-center gap-1">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <BatteryFull className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}

export function MobileForge() {
  const { user } = useNova()
  return (
    <div className="flex h-full flex-col bg-nova-panel">
      <div className="flex h-10 items-center gap-2 border-b border-border px-4">
        <Smartphone className="h-4 w-4 text-nova-cyan" />
        <span className="text-[13px] font-semibold">Mobile App Forge</span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Live cross-platform preview · {user?.legendary ? 'unlimited' : 'free tier'}
        </span>
      </div>

      <div className="nova-scroll flex flex-1 items-center justify-center gap-10 overflow-auto p-8">
        {/* iOS */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-[540px] w-[264px] rounded-[42px] border-[10px] border-[#1b1b22] bg-background shadow-2xl">
            <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#1b1b22]" />
            <div className="h-full w-full overflow-hidden rounded-[30px]">
              <StatusBar label="9:41" />
              <div className="h-[calc(100%-24px)]">
                <AppScreen accent="var(--nova-amber)" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">iPhone 15 Pro · iOS</span>
        </div>

        {/* Android */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-[540px] w-[262px] rounded-[30px] border-[8px] border-[#22222b] bg-background shadow-2xl">
            <div className="absolute left-1/2 top-2.5 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#22222b]" />
            <div className="h-full w-full overflow-hidden rounded-[22px]">
              <StatusBar label="9:41" />
              <div className="h-[calc(100%-24px)]">
                <AppScreen accent="var(--nova-cyan)" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Pixel 8 · Android</span>
        </div>
      </div>
    </div>
  )
}
