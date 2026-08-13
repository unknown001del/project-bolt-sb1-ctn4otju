import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { StoryProject, SceneFrame, Genre } from '@/types';
import { uid } from '@/lib/promptEngine';

const STORAGE_KEY = 'alpha-studio-projects-v1';

interface ProjectContextValue {
  projects: StoryProject[];
  activeProject: StoryProject | null;
  activeProjectId: string | null;
  createProject: (title: string, genre: Genre, script: string) => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, title: string) => void;
  setActiveProjectId: (id: string | null) => void;
  updateScript: (id: string, script: string) => void;
  setFrames: (id: string, frames: SceneFrame[]) => void;
  updateFrame: (projectId: string, frameId: string, patch: Partial<SceneFrame>) => void;
  reorderFrames: (projectId: string, ids: string[]) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}

function loadProjects(): StoryProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && typeof p.id === 'string');
  } catch {
    return [];
  }
}

function saveProjects(projects: StoryProject[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Storage might be full — fail silently
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    if (loaded.length > 0) setActiveProjectId(loaded[0].id);
  }, []);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const createProject = useCallback((title: string, genre: Genre, script: string): string => {
    const id = uid();
    const now = Date.now();
    const project: StoryProject = {
      id, title, genre, script, frames: [], createdAt: now, updatedAt: now,
    };
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(id);
    return id;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setActiveProjectId((cur) => {
        if (cur !== id) return cur;
        return next[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  const renameProject = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, title: trimmed, updatedAt: Date.now() } : p));
  }, []);

  const updateScript = useCallback((id: string, script: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, script, updatedAt: Date.now() } : p));
  }, []);

  const setFrames = useCallback((id: string, frames: SceneFrame[]) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, frames, updatedAt: Date.now() } : p));
  }, []);

  const updateFrame = useCallback((projectId: string, frameId: string, patch: Partial<SceneFrame>) => {
    setProjects((prev) => prev.map((p) => p.id !== projectId ? p : {
      ...p,
      frames: p.frames.map((f) => f.id === frameId ? { ...f, ...patch } : f),
      updatedAt: Date.now(),
    }));
  }, []);

  const reorderFrames = useCallback((projectId: string, ids: string[]) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const map = new Map(p.frames.map((f) => [f.id, f]));
      const reordered = ids.map((id) => map.get(id)).filter(Boolean) as SceneFrame[];
      return { ...p, frames: reordered, updatedAt: Date.now() };
    }));
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects, activeProject, activeProjectId,
      createProject, deleteProject, renameProject, setActiveProjectId,
      updateScript, setFrames, updateFrame, reorderFrames,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}
