import { useState, useCallback, useRef, useEffect } from 'react';
import { ProjectProvider, useProject } from '@/lib/projectContext';
import type { SceneFrame } from '@/types';
import AlphaLogo from '@/components/AlphaLogo';
import ScriptPanel from '@/components/ScriptPanel';
import CinemaPlayer from '@/components/CinemaPlayer';
import TimelineMaster from '@/components/TimelineMaster';
import ConfirmModal from '@/components/ConfirmModal';
import { Sparkles, Film, Trash2, FolderOpen, Plus, Pencil, Check, X, Keyboard } from 'lucide-react';

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function StudioWorkspace() {
  const { activeProject, projects, setActiveProjectId, setFrames, reorderFrames, deleteProject, createProject, renameProject } = useProject();
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const projectBtnRef = useRef<HTMLButtonElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const frames = activeProject?.frames ?? [];

  useEffect(() => {
    if (renaming) renameInputRef.current?.select();
  }, [renaming]);

  const handleGenerationStart = useCallback(() => {
    setAiProcessing(true);
  }, []);

  const handleGenerationComplete = useCallback((newFrames: SceneFrame[]) => {
    if (activeProject) {
      setFrames(activeProject.id, newFrames);
    }
    setActiveFrameIndex(0);
    setAiProcessing(false);
  }, [activeProject, setFrames]);

  const handleReorder = useCallback((from: number, to: number) => {
    if (!activeProject) return;
    const ids = activeProject.frames.map((f) => f.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    reorderFrames(activeProject.id, ids);
  }, [activeProject, reorderFrames]);

  const handleDeleteFrame = useCallback((index: number) => {
    if (!activeProject) return;
    const newFrames = activeProject.frames.filter((_, i) => i !== index);
    setFrames(activeProject.id, newFrames);
    if (activeFrameIndex >= newFrames.length) {
      setActiveFrameIndex(Math.max(0, newFrames.length - 1));
    }
  }, [activeProject, setFrames, activeFrameIndex]);

  const handleNewProject = useCallback(() => {
    createProject('Untitled Project', 'custom', '');
    setActiveFrameIndex(0);
    setShowProjectList(false);
  }, [createProject]);

  const startRename = useCallback(() => {
    if (!activeProject) return;
    setRenameValue(activeProject.title);
    setRenaming(true);
  }, [activeProject]);

  const commitRename = useCallback(() => {
    if (activeProject && renameValue.trim()) {
      renameProject(activeProject.id, renameValue);
    }
    setRenaming(false);
  }, [activeProject, renameValue, renameProject]);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      setActiveFrameIndex(0);
    }
  }, [deleteTarget, deleteProject]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-onyx text-zinc-100 noise-overlay">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-600/5 blur-3xl" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-30 flex items-center gap-4 border-b border-white/[0.06] bg-obsidian/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <AlphaLogo size={36} glowing={aiProcessing} />
          <div>
            <h1 className="font-display text-base font-bold leading-none tracking-wider text-white">
              ALPHA <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">STUDIO</span>
            </h1>
            <p className="mt-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500">AI Anime Production Suite</p>
          </div>
        </div>

        <div className="mx-2 h-8 w-px bg-white/[0.06]" />

        {/* Project selector */}
        <div className="relative">
          <button
            ref={projectBtnRef}
            onClick={() => setShowProjectList((s) => !s)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.03]"
          >
            <FolderOpen size={14} className="text-violet-400/60" />
            <span className="max-w-40 truncate">{activeProject?.title ?? 'No project'}</span>
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-500">{projects.length}</span>
          </button>

          {showProjectList && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectList(false)} />
              <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/[0.08] bg-obsidian p-2 shadow-2xl backdrop-blur animate-slide-up">
                <button
                  onClick={handleNewProject}
                  className="mb-1 flex w-full items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20"
                >
                  <Plus size={14} /> New Project
                </button>
                <div className="max-h-64 overflow-y-auto scroll-thin">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setActiveProjectId(p.id); setActiveFrameIndex(0); setShowProjectList(false); }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.04] ${activeProject?.id === p.id ? 'bg-white/[0.06] ring-1 ring-violet-500/20' : ''}`}
                    >
                      <Film size={12} className={activeProject?.id === p.id ? 'text-violet-400' : 'text-zinc-500'} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-zinc-300">{p.title}</p>
                        <p className="text-[9px] text-zinc-600">
                          {p.frames.length} frames · {p.genre.replace('-', ' ')} · {formatRelativeTime(p.updatedAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                  {projects.length === 0 && (
                    <p className="px-3 py-6 text-center text-xs text-zinc-600">
                      No projects yet — pick a template and generate your first anime.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Inline rename */}
        {activeProject && (
          renaming ? (
            <div className="flex items-center gap-1">
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setRenaming(false);
                }}
                className="w-40 rounded-md border border-violet-400/30 bg-onyx px-2 py-1 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-violet-400/30"
              />
              <button onClick={commitRename} className="grid h-7 w-7 place-items-center rounded-md text-emerald-400 hover:bg-emerald-500/10" aria-label="Save name">
                <Check size={14} />
              </button>
              <button onClick={() => setRenaming(false)} className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-white/[0.06]" aria-label="Cancel rename">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={startRename}
              className="grid h-7 w-7 place-items-center rounded-md text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-400"
              aria-label="Rename project"
              title="Rename project"
            >
              <Pencil size={12} />
            </button>
          )
        )}

        {/* Status badges */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-400 sm:flex">
            <Sparkles size={10} /> Free Tier · Unlimited
          </div>
          {aiProcessing && (
            <div className="flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-medium text-violet-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" /> AI Processing
            </div>
          )}
          {activeProject && (
            <button
              onClick={() => setDeleteTarget({ id: activeProject.id, title: activeProject.title })}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.06] text-zinc-500 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
              aria-label="Delete project"
              title="Delete project"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ===== MAIN 3-AREA LAYOUT ===== */}
      <div className="relative flex flex-1 gap-3 overflow-hidden p-3">
        <aside className="w-80 shrink-0 overflow-hidden rounded-xl border border-white/[0.04] bg-obsidian/40 p-4 glass-panel">
          <ScriptPanel
            onGenerationStart={handleGenerationStart}
            onGenerationComplete={handleGenerationComplete}
          />
        </aside>

        <main className="flex flex-1 flex-col gap-3 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CinemaPlayer
              frames={frames}
              activeFrameIndex={activeFrameIndex}
              onFrameChange={setActiveFrameIndex}
            />
          </div>

          <div className="h-44 shrink-0">
            <TimelineMaster
              frames={frames}
              activeIndex={activeFrameIndex}
              onSelect={setActiveFrameIndex}
              onReorder={handleReorder}
              onDelete={handleDeleteFrame}
            />
          </div>
        </main>
      </div>

      {/* ===== FOOTER STATUS BAR ===== */}
      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.04] bg-obsidian/80 px-5 py-1.5 text-[10px] font-mono text-zinc-500 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">Alpha Studio v1.0.0</span>
          <span className="rounded border border-white/[0.06] px-1.5 py-0.5 text-zinc-600">Free Tier</span>
          {activeProject && (
            <span className="hidden text-zinc-600 sm:inline">
              {frames.length} frames · {frames.reduce((s, f) => s + f.duration, 0)}s runtime
            </span>
          )}
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 4px #22d3ee' }} />
            Pollinations.ai · Connected
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowShortcuts((s) => !s)}
            className="hidden items-center gap-1 text-zinc-600 transition hover:text-zinc-400 md:flex"
            title="Keyboard shortcuts"
          >
            <Keyboard size={11} />
            Shortcuts
          </button>
          <span className="hidden md:inline">Engine: Canvas2D + WebAudio</span>
          <span className="flex items-center gap-1.5 text-emerald-400/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ filter: 'drop-shadow(0 0 3px #34d399)' }} />
            System Status: Nominal
          </span>
        </div>
      </footer>

      {/* Keyboard shortcuts popover */}
      {showShortcuts && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
          <div className="fixed bottom-10 right-5 z-50 w-56 rounded-xl border border-white/[0.08] bg-obsidian p-4 shadow-2xl animate-slide-up">
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Player Shortcuts</h4>
            <dl className="space-y-1.5 text-[11px]">
              {[
                ['Space', 'Play / Pause'],
                ['← / →', 'Previous / Next frame'],
                ['N', 'Toggle AI narration'],
                ['M', 'Mute'],
                ['F', 'Fullscreen'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400">{desc}</dt>
                  <dd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-zinc-300">{key}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <StudioWorkspace />
    </ProjectProvider>
  );
}
