'use client'

import { useState } from 'react'
import { useNova } from '@/lib/nova/store'
import { TopBar } from './top-bar'
import { ActivityBar } from './activity-bar'
import { SidePanel } from './side-panel'
import { MainViewport } from './main-viewport'
import { TerminalDock } from './terminal-dock'
import { ChatDrawer } from './chat-drawer'
import { AuthPortal } from './auth-portal'

export function Workspace() {
  const { setActivity } = useNova()
  const [terminalCollapsed, setTerminalCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <TopBar onDeploy={() => setActivity('cloud')} />

      <div className="flex min-h-0 flex-1">
        <ActivityBar />

        <div className="w-60 shrink-0 border-r border-border">
          <SidePanel />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <MainViewport />
          </div>
          <TerminalDock
            collapsed={terminalCollapsed}
            onToggle={() => setTerminalCollapsed((c) => !c)}
          />
        </div>

        <ChatDrawer />
      </div>

      <AuthPortal />
    </div>
  )
}
