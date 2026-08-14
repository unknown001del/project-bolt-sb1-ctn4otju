'use client'

import { Code2, LayoutTemplate, X, Crown, Sparkles } from 'lucide-react'
import { useNova } from '@/lib/nova/store'
import { CodeEditor } from './code-editor'
import { VisualCanvas } from './visual-canvas'
import { DatabaseMatrix } from './database-matrix'
import { AssetStudio } from './asset-studio'
import { CloudMatrix } from './cloud-matrix'
import { HelpDesk } from './help-desk'

export function MainViewport() {
  const {
    activity,
    mainView,
    setMainView,
    openTabs,
    files,
    activeFilePath,
    setActiveFile,
    closeTab,
    user,
    upgradeToLegendary,
  } = useNova()

  if (activity === 'database') return <DatabaseMatrix />
  if (activity === 'assets') return <AssetStudio />
  if (activity === 'cloud') return <CloudMatrix />
  if (activity === 'help') return <HelpDesk />

  const tabFiles = openTabs
    .map((p) => files.find((f) => f.path === p))
    .filter(Boolean) as typeof files

  return (
    <div className="flex h-full flex-col">
      {/* view switch + upgrade */}
      <div className="flex h-10 items-center gap-2 border-b border-border bg-nova-panel px-2">
        <div className="flex rounded-md border border-border bg-secondary/50 p-0.5">
          <button
            onClick={() => setMainView('code')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              mainView === 'code' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" /> Code
          </button>
          <button
            onClick={() => setMainView('canvas')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              mainView === 'canvas' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <LayoutTemplate className="h-3.5 w-3.5" /> Canvas
          </button>
        </div>

        {user && !user.legendary && (
          <button
            onClick={upgradeToLegendary}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary/20"
          >
            <Crown className="h-3.5 w-3.5" /> Upgrade to Legendary
          </button>
        )}
        {user?.legendary && (
          <span className="ml-auto flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Legendary Creator · unlimited
          </span>
        )}
      </div>

      {mainView === 'code' ? (
        <div className="flex h-full flex-col overflow-hidden">
          {/* tab strip */}
          <div className="nova-scroll flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-nova-panel">
            {tabFiles.length === 0 && (
              <span className="flex items-center px-3 text-xs text-muted-foreground">
                No open tabs
              </span>
            )}
            {tabFiles.map((f) => (
              <div
                key={f.path}
                className={`group flex cursor-pointer items-center gap-2 border-r border-border px-3 text-xs transition ${
                  activeFilePath === f.path
                    ? 'bg-card text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
                onClick={() => setActiveFile(f.path)}
              >
                <span className="font-mono">{f.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(f.path)
                  }}
                  className="rounded p-0.5 opacity-0 transition hover:bg-secondary group-hover:opacity-100"
                  aria-label={`Close ${f.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor />
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <VisualCanvas />
        </div>
      )}
    </div>
  )
}
