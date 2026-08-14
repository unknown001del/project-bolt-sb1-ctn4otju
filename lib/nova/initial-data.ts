import type {
  NovaFile,
  DbTable,
  ChatMessage,
  TeammateCursor,
  Collaborator,
  BlueprintPlan,
} from './types'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function domainFromPrompt(p: string): { kind: string; entity: string } {
  const t = p.toLowerCase()
  if (/shop|store|commerce|product|checkout|cart/.test(t)) return { kind: 'commerce', entity: 'Product' }
  if (/social|post|feed|follow|friend/.test(t)) return { kind: 'social', entity: 'Post' }
  if (/task|todo|project|kanban|board/.test(t)) return { kind: 'productivity', entity: 'Task' }
  if (/chat|message|dm|inbox/.test(t)) return { kind: 'messaging', entity: 'Message' }
  if (/book|appointment|reserv|schedul/.test(t)) return { kind: 'booking', entity: 'Booking' }
  if (/blog|article|cms|content/.test(t)) return { kind: 'content', entity: 'Article' }
  return { kind: 'app', entity: 'Item' }
}

/**
 * Bertin's deterministic "reasoning" — turns a rough idea into a
 * structured, beginner-friendly build plan plus real generated files.
 */
export function buildBlueprint(prompt: string): BlueprintPlan {
  const { kind, entity } = domainFromPrompt(prompt)
  const e = entity.toLowerCase()
  const es = `${e}s`
  const idea = prompt.trim() || `A ${kind} application`

  const architecture = [
    { label: 'Next.js 16 App Router shell', detail: 'Server components + route groups', done: true },
    { label: 'Nova Cryo-Obsidian design system', detail: 'Tokens, typography, glass panels', done: true },
    { label: `${entity} domain module`, detail: `CRUD flows for ${es}`, done: true },
    { label: 'Auth & session tier', detail: 'Email + password, guest fallback', done: false },
    { label: 'Persistence layer', detail: 'Drizzle schema + server actions', done: false },
    { label: 'Deploy target', detail: 'Edge-ready, zero-config Vercel', done: false },
  ]

  const schemas = [
    { table: 'users', columns: ['id serial pk', 'alias text', 'email text unique', 'created_at timestamp'] },
    {
      table: es,
      columns: [
        'id serial pk',
        'user_id integer -> users',
        `title text`,
        kind === 'commerce' ? 'price numeric' : 'body text',
        'created_at timestamp',
      ],
    },
    {
      table: 'events',
      columns: ['id serial pk', `${e}_id integer -> ${es}`, 'kind text', 'payload text', 'created_at timestamp'],
    },
  ]

  const wireframes = [
    { screen: 'Landing', blocks: ['Nav bar', 'Hero + CTA', 'Feature grid', 'Footer'] },
    { screen: `${entity} Dashboard`, blocks: [`${entity} list`, 'Filter rail', 'Detail drawer', 'Create button'] },
    { screen: 'Account Portal', blocks: ['Sign in / up', 'Cloud target', 'DB framework'] },
  ]

  const files = [
    {
      path: `app/${es}/page.tsx`,
      language: 'tsx' as const,
      content: `import { ${entity}List } from "@/components/${e}-list"

export default function ${entity}DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">${cap(es)}</h1>
          <p className="text-muted-foreground">${idea}</p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">
          New ${entity}
        </button>
      </header>
      <${entity}List />
    </main>
  )
}
`,
    },
    {
      path: `components/${e}-list.tsx`,
      language: 'tsx' as const,
      content: `import { db } from "@/lib/db/client"
import { ${es} } from "@/lib/db/schema"

export async function ${entity}List() {
  const rows = await db.select().from(${es})
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {rows.map((row) => (
        <li key={row.id} className="rounded-lg border border-border p-4">
          <span className="font-medium">{row.title}</span>
        </li>
      ))}
    </ul>
  )
}
`,
    },
    {
      path: 'lib/db/schema.ts',
      language: 'ts' as const,
      content: `import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  alias: text("alias").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const ${es} = pgTable("${es}", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  ${kind === 'commerce' ? 'price: numeric("price"),' : 'body: text("body"),'}
  createdAt: timestamp("created_at").defaultNow(),
})
`,
    },
  ]

  return {
    prompt: idea,
    summary: `A ${kind} platform centered on ${es}. I mapped ${architecture.length} architectural pillars, ${schemas.length} relational tables, and ${wireframes.length} core screens. Review and refine below, then ignite the compiler.`,
    architecture,
    schemas,
    wireframes,
    files,
  }
}

export const INITIAL_FILES: NovaFile[] = [
  {
    path: 'app/page.tsx',
    name: 'page.tsx',
    language: 'tsx',
    content: `import { Hero } from "@/components/hero"
import { FeatureGrid } from "@/components/feature-grid"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Hero title="Nova" subtitle="Ship full-stack, from a browser." />
      <FeatureGrid />
    </main>
  )
}
`,
  },
  {
    path: 'components/hero.tsx',
    name: 'hero.tsx',
    language: 'tsx',
    content: `type HeroProps = {
  title: string
  subtitle: string
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight">{title}</h1>
      <p className="text-lg text-muted-foreground">{subtitle}</p>
    </section>
  )
}
`,
  },
  {
    path: 'components/feature-grid.tsx',
    name: 'feature-grid.tsx',
    language: 'tsx',
    content: `const features = ["Visual Canvas", "Live Collab", "Local Mirror"]

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {features.map((f) => (
        <div key={f} className="rounded-lg border p-6">
          {f}
        </div>
      ))}
    </div>
  )
}
`,
  },
  {
    path: 'lib/db/schema.ts',
    name: 'schema.ts',
    language: 'ts',
    content: `import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  alias: text("alias").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
})
`,
  },
  {
    path: 'app/globals.css',
    name: 'globals.css',
    language: 'css',
    content: `@import "tailwindcss";

:root {
  --background: #050507;
  --foreground: #e7e9ef;
}
`,
  },
]

export const INITIAL_TABLES: DbTable[] = [
  {
    id: 'users',
    name: 'Users',
    x: 40,
    y: 48,
    color: '#ff6b00',
    columns: [
      { name: 'id', type: 'serial', pk: true },
      { name: 'alias', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'created_at', type: 'timestamp' },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    x: 360,
    y: 60,
    color: '#26e0f0',
    columns: [
      { name: 'id', type: 'serial', pk: true },
      { name: 'user_id', type: 'integer', fk: 'users' },
      { name: 'total', type: 'numeric' },
      { name: 'status', type: 'text' },
    ],
  },
  {
    id: 'wallets',
    name: 'Wallets',
    x: 200,
    y: 300,
    color: '#7c5cff',
    columns: [
      { name: 'id', type: 'serial', pk: true },
      { name: 'user_id', type: 'integer', fk: 'users' },
      { name: 'balance', type: 'numeric' },
    ],
  },
]

export const COLLABORATORS: Collaborator[] = [
  { id: 'alex', name: 'Alex', role: 'Lead AI Architect', color: '#26e0f0', speaking: true },
  { id: 'sarah', name: 'Sarah', role: 'Systems Lead', color: '#7c5cff', speaking: false },
  { id: 'you', name: 'You', role: 'Creator', color: '#ff6b00', speaking: false },
]

export const INITIAL_CURSORS: TeammateCursor[] = [
  { id: 'alex', name: 'Alex', color: '#26e0f0', line: 3, ch: 22 },
  { id: 'sarah', name: 'Sarah', color: '#7c5cff', line: 7, ch: 8 },
]

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'm1',
    author: 'Alex',
    role: 'ai-architect',
    color: '#26e0f0',
    text: 'Pushed the Hero refactor — pulling props from the schema now.',
    ts: Date.now() - 1000 * 60 * 8,
  },
  {
    id: 'm2',
    author: 'Sarah',
    role: 'systems',
    color: '#7c5cff',
    text: 'Nice. I wired Orders → Users in the Database Nexus.',
    ts: Date.now() - 1000 * 60 * 5,
  },
]
