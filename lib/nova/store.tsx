'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  ActivityId,
  BlueprintPhase,
  BlueprintPlan,
  CanvasNode,
  ChatMessage,
  DbTable,
  HistorySnapshot,
  MainView,
  NovaFile,
  NovaUser,
  TerminalLine,
} from './types'
import { GUEST_LIMIT } from './types'
import {
  buildBlueprint,
  INITIAL_CHAT,
  INITIAL_FILES,
  INITIAL_TABLES,
} from './initial-data'

const STORAGE_KEY = 'nova-console-state-v1'

let idc = 0
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(idc++).toString(36)}`

function generateCanvasCode(nodes: CanvasNode[]): string {
  if (nodes.length === 0) {
    return `export function CanvasView() {
  return null
}
`
  }
  const body = nodes
    .map((n) => {
      const cls = [
        n.display === 'flex' ? 'flex' : n.display === 'grid' ? 'grid' : 'block',
        n.display === 'flex' ? (n.direction === 'col' ? 'flex-col' : 'flex-row') : '',
        'items-center justify-center',
        `p-[${n.padding}px]`,
        `rounded-[${n.radius}px]`,
      ]
        .filter(Boolean)
        .join(' ')
      const style = `{{ width: ${n.w}, height: ${n.h}, background: "${n.bg}", color: "${n.color}" }}`
      const Tag = n.tag
      return `      <${Tag} className="${cls}" style=${style}>
        ${n.text || n.label}
      </${Tag}>`
    })
    .join('\n')
  return `// Auto-compiled from Nova Visual Canvas — do not hand-edit generated frames.
export function CanvasView() {
  return (
    <div className="relative">
${body}
    </div>
  )
}
`
}

function generateSchema(tables: DbTable[]): string {
  const imports = `import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core"\n\n`
  const typeMap: Record<string, string> = {
    serial: 'serial',
    integer: 'integer',
    text: 'text',
    numeric: 'numeric',
    timestamp: 'timestamp',
  }
  const blocks = tables
    .map((t) => {
      const cols = t.columns
        .map((c) => {
          const fn = typeMap[c.type] ?? 'text'
          let line = `  ${c.name}: ${fn}("${c.name}")`
          if (c.pk) line += '.primaryKey()'
          if (fn === 'timestamp') line += '.defaultNow()'
          if (c.fk) line += ` /* -> ${c.fk}.id */`
          return line + ','
        })
        .join('\n')
      return `export const ${t.id} = pgTable("${t.id}", {\n${cols}\n})`
    })
    .join('\n\n')
  return imports + blocks + '\n'
}

type PersistShape = {
  user: NovaUser | null
  guestOpsUsed: number
  seenBlueprint?: boolean
}

type NovaContextValue = {
  // state
  user: NovaUser | null
  guestOpsUsed: number
  guestLimit: number
  authOpen: boolean
  activity: ActivityId
  mainView: MainView
  files: NovaFile[]
  activeFilePath: string
  openTabs: string[]
  tables: DbTable[]
  canvasNodes: CanvasNode[]
  selectedNodeId: string | null
  terminal: TerminalLine[]
  chat: ChatMessage[]
  chatOpen: boolean
  mirrored: boolean
  mirrorRoot: string | null
  bertinPrompt: boolean
  // blueprint
  blueprintOpen: boolean
  blueprintPhase: BlueprintPhase
  blueprintPlan: BlueprintPlan | null
  blueprintChat: ChatMessage[]
  // time travel
  history: HistorySnapshot[]
  historyIndex: number
  refactorBusy: boolean
  activeFile: NovaFile | undefined
  selectedNode: CanvasNode | undefined
  // actions
  setActivity: (a: ActivityId) => void
  setMainView: (v: MainView) => void
  setAuthOpen: (b: boolean) => void
  openFile: (path: string) => void
  closeTab: (path: string) => void
  setActiveFile: (path: string) => void
  updateFileContent: (path: string, content: string) => void
  pushTerminal: (stream: TerminalLine['stream'], text: string) => void
  runCommand: (cmd: string) => void
  signIn: (u: Omit<NovaUser, 'legendary'>) => void
  signOut: () => void
  upgradeToLegendary: () => void
  consumeOp: (label: string) => boolean
  addCanvasNode: (tag: CanvasNode['tag']) => void
  updateNode: (id: string, patch: Partial<CanvasNode>) => void
  selectNode: (id: string | null) => void
  deleteNode: (id: string) => void
  moveTable: (id: string, x: number, y: number) => void
  syncSchema: () => void
  sendChat: (text: string) => void
  setChatOpen: (b: boolean) => void
  triggerBertin: (reason: string) => void
  dismissBertin: () => void
  mirrorLocalDisk: () => Promise<void>
  // blueprint actions
  openBlueprint: (prompt?: string) => void
  submitBlueprintPrompt: (prompt: string) => void
  refineBlueprint: (text: string) => void
  toggleArchitectureItem: (index: number) => void
  igniteCompiler: () => void
  closeBlueprint: () => void
  // time travel
  scrubHistory: (index: number) => void
  // refactor
  refactorActiveFile: (instruction: string) => void
}

const NovaContext = createContext<NovaContextValue | null>(null)

const CANVAS_FILE = 'app/generated/canvas.tsx'
const SCHEMA_FILE = 'lib/db/schema.ts'

export function NovaProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NovaUser | null>(null)
  const [guestOpsUsed, setGuestOpsUsed] = useState(0)
  const [authOpen, setAuthOpen] = useState(false)
  const [activity, setActivity] = useState<ActivityId>('files')
  const [mainView, setMainView] = useState<MainView>('code')
  const [files, setFiles] = useState<NovaFile[]>(INITIAL_FILES)
  const [activeFilePath, setActiveFilePath] = useState<string>(INITIAL_FILES[0].path)
  const [openTabs, setOpenTabs] = useState<string[]>([
    INITIAL_FILES[0].path,
    INITIAL_FILES[1].path,
  ])
  const [tables, setTables] = useState<DbTable[]>(INITIAL_TABLES)
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [terminal, setTerminal] = useState<TerminalLine[]>([
    {
      id: uid('t'),
      stream: 'system',
      text: 'Nova kernel v3.1 online — Cryo-Obsidian runtime attached.',
      ts: Date.now(),
    },
  ])
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT)
  const [chatOpen, setChatOpen] = useState(true)
  const [mirrored, setMirrored] = useState(false)
  const [mirrorRoot, setMirrorRoot] = useState<string | null>(null)
  const [bertinPrompt, setBertinPrompt] = useState(false)

  const [blueprintOpen, setBlueprintOpen] = useState(false)
  const [blueprintPhase, setBlueprintPhase] = useState<BlueprintPhase>('idle')
  const [blueprintPlan, setBlueprintPlan] = useState<BlueprintPlan | null>(null)
  const [blueprintChat, setBlueprintChat] = useState<ChatMessage[]>([])

  const [history, setHistory] = useState<HistorySnapshot[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [refactorBusy, setRefactorBusy] = useState(false)

  const dirHandleRef = useRef<any>(null)
  const hydrated = useRef(false)

  // hydrate from localStorage
  useEffect(() => {
    let seenBlueprint = false
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PersistShape
        if (parsed.user) setUser(parsed.user)
        if (typeof parsed.guestOpsUsed === 'number') setGuestOpsUsed(parsed.guestOpsUsed)
        seenBlueprint = !!parsed.seenBlueprint
      }
    } catch {
      /* ignore */
    }
    // seed the initial time-travel checkpoint
    setHistory([
      {
        id: uid('snap'),
        label: 'Genesis — workspace initialized',
        ts: Date.now(),
        files: INITIAL_FILES,
        tables: INITIAL_TABLES,
        canvasNodes: [],
      },
    ])
    setHistoryIndex(0)
    // first-time visitors are ushered into the mandatory Bertin Blueprint Space
    if (!seenBlueprint) {
      setBlueprintOpen(true)
      setBlueprintPhase('idle')
    }
    hydrated.current = true
  }, [])

  // persist
  useEffect(() => {
    if (!hydrated.current) return
    const payload: PersistShape = {
      user,
      guestOpsUsed,
      seenBlueprint: history.length > 1 || !blueprintOpen,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [user, guestOpsUsed, history.length, blueprintOpen])

  const pushTerminal = useCallback((stream: TerminalLine['stream'], text: string) => {
    setTerminal((t) => [...t.slice(-200), { id: uid('t'), stream, text, ts: Date.now() }])
  }, [])

  const writeThrough = useCallback(async (path: string, content: string) => {
    const root = dirHandleRef.current
    if (!root) return
    try {
      const segments = path.split('/')
      const fileName = segments.pop() as string
      let dir = root
      for (const seg of segments) {
        dir = await dir.getDirectoryHandle(seg, { create: true })
      }
      const fileHandle = await dir.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      pushTerminal('success', `disk-mirror ✓ wrote ${path}`)
    } catch (err) {
      pushTerminal('error', `disk-mirror ✗ ${path}: ${(err as Error).message}`)
    }
  }, [pushTerminal])

  const upsertFile = useCallback(
    (path: string, content: string, language: NovaFile['language'] = 'tsx') => {
      setFiles((prev) => {
        const existing = prev.find((f) => f.path === path)
        if (existing) {
          return prev.map((f) => (f.path === path ? { ...f, content } : f))
        }
        const name = path.split('/').pop() as string
        return [...prev, { path, name, language, content }]
      })
      void writeThrough(path, content)
    },
    [writeThrough],
  )

  const consumeOp = useCallback(
    (label: string): boolean => {
      if (user) return true
      if (guestOpsUsed >= GUEST_LIMIT) {
        setAuthOpen(true)
        pushTerminal('error', `guest-quota exhausted — "${label}" locked. Authorize to continue.`)
        return false
      }
      setGuestOpsUsed((n) => n + 1)
      pushTerminal('system', `guest-op ${guestOpsUsed + 1}/${GUEST_LIMIT} — ${label}`)
      return true
    },
    [user, guestOpsUsed, pushTerminal],
  )

  const openFile = useCallback((path: string) => {
    setOpenTabs((tabs) => (tabs.includes(path) ? tabs : [...tabs, path]))
    setActiveFilePath(path)
    setMainView('code')
  }, [])

  const closeTab = useCallback(
    (path: string) => {
      setOpenTabs((tabs) => {
        const next = tabs.filter((t) => t !== path)
        setActiveFilePath((cur) => (cur === path ? next[next.length - 1] ?? '' : cur))
        return next
      })
    },
    [],
  )

  const updateFileContent = useCallback(
    (path: string, content: string) => {
      setFiles((prev) => prev.map((f) => (f.path === path ? { ...f, content } : f)))
      void writeThrough(path, content)
    },
    [writeThrough],
  )

  const runCommand = useCallback(
    (cmd: string) => {
      if (!consumeOp(`terminal: ${cmd}`)) return
      pushTerminal('command', `nova@obsidian:~/project$ ${cmd}`)
      const seq: Array<[TerminalLine['stream'], string, number]> = []
      if (cmd.includes('dev')) {
        seq.push(['stdout', '▲ Next.js 16.3.0 — Turbopack', 220])
        seq.push(['stdout', '- Local:   http://localhost:3000', 380])
        seq.push(['stdout', '- Compiling / ...', 620])
        seq.push(['success', '✓ Ready — hot-reload mirror active in 812ms', 900])
      } else if (cmd.includes('build')) {
        seq.push(['stdout', 'Creating optimized production build ...', 240])
        seq.push(['stdout', 'Compiled successfully — 12 routes', 700])
        seq.push(['stdout', 'Collecting page data ...', 1000])
        seq.push(['success', '✓ Build complete — 0 errors, 0 warnings', 1400])
      } else if (cmd.includes('git push')) {
        seq.push(['stdout', 'Enumerating objects: 42, done.', 200])
        seq.push(['stdout', 'Writing objects: 100% (42/42)', 520])
        seq.push(['stdout', 'remote: Resolving deltas: 100%', 820])
        seq.push(['success', '✓ Pushed to origin/main — self-heal check passed', 1200])
      } else {
        seq.push(['stdout', `executing "${cmd}" in sandbox kernel ...`, 260])
        seq.push(['success', '✓ done', 620])
      }
      seq.forEach(([stream, text, delay]) => {
        setTimeout(() => pushTerminal(stream, text), delay)
      })
    },
    [consumeOp, pushTerminal],
  )

  const signIn = useCallback((u: Omit<NovaUser, 'legendary'>) => {
    const full: NovaUser = { ...u, legendary: false }
    setUser(full)
    setAuthOpen(false)
    pushTerminal('success', `identity linked — ${u.alias} @ ${u.cloud}`)
  }, [pushTerminal])

  const signOut = useCallback(() => {
    setUser(null)
    setGuestOpsUsed(0)
  }, [])

  const upgradeToLegendary = useCallback(() => {
    setUser((u) => (u ? { ...u, legendary: true } : u))
    pushTerminal('success', 'Legendary Creator Level unlocked — unlimited tools, free forever.')
  }, [pushTerminal])

  const regenCanvas = useCallback(
    (nodes: CanvasNode[]) => {
      const code = generateCanvasCode(nodes)
      upsertFile(CANVAS_FILE, code, 'tsx')
    },
    [upsertFile],
  )

  const addCanvasNode = useCallback(
    (tag: CanvasNode['tag']) => {
      if (!consumeOp(`canvas: add <${tag}>`)) return
      const node: CanvasNode = {
        id: uid('node'),
        label: tag === 'button' ? 'Button' : tag === 'h1' ? 'Heading' : 'Frame',
        tag,
        x: 60 + Math.random() * 120,
        y: 60 + Math.random() * 80,
        w: tag === 'button' ? 150 : 240,
        h: tag === 'button' ? 48 : 140,
        bg: tag === 'button' ? '#ff6b00' : '#101016',
        color: tag === 'button' ? '#0a0500' : '#e7e9ef',
        radius: 12,
        padding: 16,
        display: 'flex',
        direction: 'col',
        text: tag === 'button' ? 'Deploy' : tag === 'h1' ? 'Nova' : 'Frame',
      }
      setCanvasNodes((prev) => {
        const next = [...prev, node]
        regenCanvas(next)
        return next
      })
      setSelectedNodeId(node.id)
      openFile(CANVAS_FILE)
      setMainView('canvas')
    },
    [consumeOp, regenCanvas, openFile],
  )

  const updateNode = useCallback(
    (id: string, patch: Partial<CanvasNode>) => {
      setCanvasNodes((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
        regenCanvas(next)
        return next
      })
    },
    [regenCanvas],
  )

  const deleteNode = useCallback(
    (id: string) => {
      setCanvasNodes((prev) => {
        const next = prev.filter((n) => n.id !== id)
        regenCanvas(next)
        return next
      })
      setSelectedNodeId((cur) => (cur === id ? null : cur))
    },
    [regenCanvas],
  )

  const moveTable = useCallback((id: string, x: number, y: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)))
  }, [])

  const syncSchema = useCallback(() => {
    if (!consumeOp('database: sync schema')) return
    const code = generateSchema(tables)
    upsertFile(SCHEMA_FILE, code, 'ts')
    openFile(SCHEMA_FILE)
    pushTerminal('success', 'schema synced — Drizzle definitions regenerated across workspace.')
  }, [consumeOp, tables, upsertFile, openFile, pushTerminal])

  const sendChat = useCallback(
    (text: string) => {
      if (!text.trim()) return
      const msg: ChatMessage = {
        id: uid('m'),
        author: user?.alias ?? 'You',
        role: 'you',
        color: '#ff6b00',
        text,
        ts: Date.now(),
      }
      setChat((c) => [...c, msg])
      // simulated AI architect reply
      setTimeout(() => {
        setChat((c) => [
          ...c,
          {
            id: uid('m'),
            author: 'Nova Agent',
            role: 'agent',
            color: '#26e0f0',
            text: 'Analyzing dependency graph across the workspace tree — cross-file types look consistent. Applying change now.',
            ts: Date.now(),
          },
        ])
      }, 900)
    },
    [user],
  )

  const triggerBertin = useCallback(
    (reason: string) => {
      setBertinPrompt(true)
      pushTerminal('error', `roadblock detected — ${reason}`)
    },
    [pushTerminal],
  )

  const dismissBertin = useCallback(() => setBertinPrompt(false), [])

  const mirrorLocalDisk = useCallback(async () => {
    const picker = (window as any).showDirectoryPicker
    if (typeof picker !== 'function') {
      pushTerminal('error', 'File System Access API unavailable in this browser context.')
      triggerBertin('local disk mirroring is blocked by the current browser/sandbox')
      return
    }
    try {
      const handle = await picker({ mode: 'readwrite' })
      dirHandleRef.current = handle
      setMirrored(true)
      setMirrorRoot(handle.name ?? 'project')
      pushTerminal('success', `disk mirror engaged → /${handle.name}`)
      // flush current workspace to disk
      for (const f of files) {
        await writeThrough(f.path, f.content)
      }
    } catch (err) {
      pushTerminal('error', `mirror aborted: ${(err as Error).message}`)
    }
  }, [files, pushTerminal, triggerBertin, writeThrough])

  const commitHistory = useCallback(
    (label: string) => {
      setHistory((prev) => {
        // drop any redo-forward states, then append
        const trimmed = prev.slice(0, historyIndex + 1)
        const snap: HistorySnapshot = {
          id: uid('snap'),
          label,
          ts: Date.now(),
          files,
          tables,
          canvasNodes,
        }
        const next = [...trimmed, snap].slice(-40)
        setHistoryIndex(next.length - 1)
        return next
      })
    },
    [files, tables, canvasNodes, historyIndex],
  )

  const scrubHistory = useCallback(
    (index: number) => {
      setHistory((prev) => {
        const snap = prev[index]
        if (!snap) return prev
        setFiles(snap.files)
        setTables(snap.tables)
        setCanvasNodes(snap.canvasNodes)
        setActiveFilePath((cur) =>
          snap.files.some((f) => f.path === cur) ? cur : snap.files[0]?.path ?? '',
        )
        pushTerminal('system', `time-travel → "${snap.label}"`)
        return prev
      })
      setHistoryIndex(index)
    },
    [pushTerminal],
  )

  // ---- Bertin Blueprint Space ----
  const openBlueprint = useCallback((prompt?: string) => {
    setBlueprintOpen(true)
    setBlueprintChat([])
    if (prompt && prompt.trim()) {
      setBlueprintPhase('thinking')
      setTimeout(() => {
        setBlueprintPlan(buildBlueprint(prompt))
        setBlueprintPhase('ready')
      }, 1100)
    } else {
      setBlueprintPhase('idle')
      setBlueprintPlan(null)
    }
  }, [])

  const submitBlueprintPrompt = useCallback((prompt: string) => {
    if (!prompt.trim()) return
    setBlueprintPhase('thinking')
    setBlueprintPlan(null)
    setBlueprintChat([
      {
        id: uid('bp'),
        author: 'You',
        role: 'you',
        color: '#ff6b00',
        text: prompt,
        ts: Date.now(),
      },
    ])
    setTimeout(() => {
      setBlueprintPlan(buildBlueprint(prompt))
      setBlueprintPhase('ready')
      setBlueprintChat((c) => [
        ...c,
        {
          id: uid('bp'),
          author: 'Bertin',
          role: 'architect',
          color: '#26e0f0',
          text: `I broke that down into a structured blueprint — architecture pillars, relational schemas, and screen wireframes. Tweak anything below, then ignite when it feels right.`,
          ts: Date.now(),
        },
      ])
    }, 1200)
  }, [])

  const refineBlueprint = useCallback((text: string) => {
    if (!text.trim()) return
    setBlueprintChat((c) => [
      ...c,
      { id: uid('bp'), author: 'You', role: 'you', color: '#ff6b00', text, ts: Date.now() },
    ])
    setTimeout(() => {
      setBlueprintChat((c) => [
        ...c,
        {
          id: uid('bp'),
          author: 'Bertin',
          role: 'architect',
          color: '#26e0f0',
          text: `Good call — folding "${text.slice(0, 48)}${text.length > 48 ? '…' : ''}" into the plan. The affected pillars are highlighted. Ignite whenever you're ready.`,
          ts: Date.now(),
        },
      ])
    }, 800)
  }, [])

  const toggleArchitectureItem = useCallback((index: number) => {
    setBlueprintPlan((p) =>
      p
        ? {
            ...p,
            architecture: p.architecture.map((a, i) =>
              i === index ? { ...a, done: !a.done } : a,
            ),
          }
        : p,
    )
  }, [])

  const igniteCompiler = useCallback(() => {
    const plan = blueprintPlan
    if (!plan) return
    setBlueprintPhase('igniting')
    pushTerminal('command', 'nova compile --from-blueprint --self-heal')
    pushTerminal('stdout', `Bertin → Nova Compiler: ${plan.files.length} files queued`)

    plan.files.forEach((f, i) => {
      setTimeout(() => {
        upsertFile(f.path, f.content, f.language)
        pushTerminal('stdout', `  ✓ generated ${f.path}`)
      }, 260 * (i + 1))
    })

    setTimeout(() => {
      pushTerminal('success', '✓ Ignition complete — self-heal validator passed, 0 broken imports.')
      setBlueprintOpen(false)
      setBlueprintPhase('idle')
      setActivity('files')
      if (plan.files[0]) {
        setActiveFilePath(plan.files[0].path)
        setOpenTabs((t) =>
          Array.from(new Set([...t, ...plan.files.map((f) => f.path)])),
        )
      }
      commitHistory(`Bertin ignition — ${plan.prompt.slice(0, 40)}`)
    }, 260 * (plan.files.length + 1) + 400)
  }, [blueprintPlan, pushTerminal, upsertFile, commitHistory])

  const closeBlueprint = useCallback(() => {
    setBlueprintOpen(false)
    setBlueprintPhase('idle')
  }, [])

  // ---- Deep semantic refactor engine ----
  const refactorActiveFile = useCallback(
    (instruction: string) => {
      if (!activeFilePath) return
      if (!consumeOp(`refactor: ${instruction.slice(0, 32)}`)) return
      setRefactorBusy(true)
      pushTerminal('command', `nova refactor "${instruction}" --target ${activeFilePath}`)
      const path = activeFilePath
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.path !== path) return f
            const banner = `// ⟢ Nova AI refactor — ${instruction}\n// dependency graph re-linked, imports verified, adjacent modules untouched.\n`
            const stripped = f.content.replace(
              /^\/\/ ⟢ Nova AI refactor[\s\S]*?untouched\.\n/,
              '',
            )
            return { ...f, content: banner + stripped }
          }),
        )
        pushTerminal('success', `✓ refactored ${path} — types consistent across workspace tree.`)
        setRefactorBusy(false)
        commitHistory(`Refactor — ${instruction.slice(0, 40)}`)
      }, 1100)
    },
    [activeFilePath, consumeOp, pushTerminal, commitHistory],
  )

  const activeFile = useMemo(
    () => files.find((f) => f.path === activeFilePath),
    [files, activeFilePath],
  )
  const selectedNode = useMemo(
    () => canvasNodes.find((n) => n.id === selectedNodeId),
    [canvasNodes, selectedNodeId],
  )

  const value: NovaContextValue = {
    user,
    guestOpsUsed,
    guestLimit: GUEST_LIMIT,
    authOpen,
    activity,
    mainView,
    files,
    activeFilePath,
    openTabs,
    tables,
    canvasNodes,
    selectedNodeId,
    terminal,
    chat,
    chatOpen,
    mirrored,
    mirrorRoot,
    bertinPrompt,
    blueprintOpen,
    blueprintPhase,
    blueprintPlan,
    blueprintChat,
    history,
    historyIndex,
    refactorBusy,
    activeFile,
    selectedNode,
    setActivity,
    setMainView,
    setAuthOpen,
    openFile,
    closeTab,
    setActiveFile: setActiveFilePath,
    updateFileContent,
    pushTerminal,
    runCommand,
    signIn,
    signOut,
    upgradeToLegendary,
    consumeOp,
    addCanvasNode,
    updateNode,
    selectNode: setSelectedNodeId,
    deleteNode,
    moveTable,
    syncSchema,
    sendChat,
    setChatOpen,
    triggerBertin,
    dismissBertin,
    mirrorLocalDisk,
    openBlueprint,
    submitBlueprintPrompt,
    refineBlueprint,
    toggleArchitectureItem,
    igniteCompiler,
    closeBlueprint,
    scrubHistory,
    refactorActiveFile,
  }

  return <NovaContext.Provider value={value}>{children}</NovaContext.Provider>
}

export function useNova() {
  const ctx = useContext(NovaContext)
  if (!ctx) throw new Error('useNova must be used within NovaProvider')
  return ctx
}
