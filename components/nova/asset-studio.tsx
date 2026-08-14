'use client'

import { useState } from 'react'
import { Wand2, Download, RefreshCw, ImageIcon } from 'lucide-react'
import { useNova } from '@/lib/nova/store'

const PRESETS = [
  'minimal geometric supernova logo, molten amber and cyan, dark background',
  'futuristic obsidian app icon, glowing N monogram, neon edge lighting',
  'abstract cryo crystal brand mark, sharp zinc facets, premium tech',
]

export function AssetStudio() {
  const { pushTerminal, consumeOp } = useNova()
  const [prompt, setPrompt] = useState(PRESETS[0])
  const [seed, setSeed] = useState(7)
  const [applied, setApplied] = useState(false)

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt,
  )}?width=512&height=512&nologo=true&seed=${seed}`

  const regenerate = () => {
    if (!consumeOp('asset studio: generate')) return
    setSeed((s) => s + 1)
    setApplied(false)
    pushTerminal('system', 'asset-studio: dispatching to Pollinations free-tier endpoint …')
  }

  const apply = () => {
    if (!consumeOp('asset studio: apply logo')) return
    setApplied(true)
    pushTerminal('success', 'asset applied → /public/logo.png (mirrored to disk if attached)')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-border px-4">
        <Wand2 className="h-4 w-4 text-nova-cyan" />
        <span className="text-sm font-semibold">Supernova Asset Studio</span>
        <span className="text-xs text-muted-foreground">Free-tier branding wizard</span>
      </div>

      <div className="nova-scroll flex flex-1 gap-6 overflow-y-auto p-6">
        <div className="flex w-72 shrink-0 flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Brand prompt
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none rounded-md border border-border bg-input px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Presets</span>
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPrompt(p)
                  setApplied(false)
                }}
                className="rounded-md border border-border bg-secondary/50 px-2.5 py-1.5 text-left text-[12px] text-foreground/80 transition hover:border-primary/40"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={regenerate}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-[13px] font-semibold transition hover:border-primary/40"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
            <button
              onClick={apply}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-bold text-primary-foreground transition hover:brightness-110"
            >
              <Download className="h-3.5 w-3.5" /> Apply
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card">
            {/* Pollinations returns an image directly from the URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={url}
              src={url || '/placeholder.svg'}
              alt="Generated Nova brand asset preview"
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
            {applied && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-emerald-500/90 px-2 py-1 text-[11px] font-bold text-background">
                <ImageIcon className="h-3 w-3" /> /public/logo.png
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">seed #{seed} · 512×512 · Pollinations.ai</p>
        </div>
      </div>
    </div>
  )
}
