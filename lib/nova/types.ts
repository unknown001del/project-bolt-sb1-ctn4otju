export type Language = 'tsx' | 'ts' | 'css' | 'json' | 'js'

export type NovaFile = {
  path: string
  name: string
  language: Language
  content: string
}

export type DbColumn = {
  name: string
  type: string
  pk?: boolean
  fk?: string
}

export type DbTable = {
  id: string
  name: string
  x: number
  y: number
  color: string
  columns: DbColumn[]
}

export type Collaborator = {
  id: string
  name: string
  role: string
  color: string
  speaking: boolean
}

export type TeammateCursor = {
  id: string
  name: string
  color: string
  line: number
  ch: number
}

export type ChatMessage = {
  id: string
  author: string
  role: string
  color: string
  text: string
  ts: number
  snippet?: string
}

export type TerminalLine = {
  id: string
  stream: 'system' | 'stdout' | 'success' | 'error' | 'command'
  text: string
  ts: number
}

export type CanvasNode = {
  id: string
  label: string
  tag: 'section' | 'div' | 'button' | 'h1' | 'p'
  x: number
  y: number
  w: number
  h: number
  bg: string
  color: string
  radius: number
  padding: number
  display: 'flex' | 'block' | 'grid'
  direction: 'row' | 'col'
  text: string
}

export type ActivityId =
  | 'files'
  | 'forge'
  | 'mobile'
  | 'database'
  | 'collab'
  | 'assets'
  | 'cloud'
  | 'help'

export type MainView = 'code' | 'canvas'

export type BlueprintPhase = 'idle' | 'thinking' | 'ready' | 'igniting'

export type BlueprintPlan = {
  prompt: string
  summary: string
  architecture: { label: string; detail: string; done: boolean }[]
  schemas: { table: string; columns: string[] }[]
  wireframes: { screen: string; blocks: string[] }[]
  files: { path: string; language: Language; content: string }[]
}

export type HistorySnapshot = {
  id: string
  label: string
  ts: number
  files: NovaFile[]
  tables: DbTable[]
  canvasNodes: CanvasNode[]
}

export type NovaUser = {
  alias: string
  cloud: string
  dbFramework: string
  legendary: boolean
}

export type NovaState = {
  user: NovaUser | null
  guestOpsUsed: number
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
}

export const GUEST_LIMIT = 5
