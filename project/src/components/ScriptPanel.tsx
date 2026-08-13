import { useState, useEffect } from 'react';
import { Sparkles, Loader2, FileText, ChevronDown, ChevronUp, Wand2, Save } from 'lucide-react';
import type { Genre, SceneFrame } from '@/types';
import { SCRIPT_TEMPLATES, getTemplate } from '@/lib/templates';
import { parseScript, sceneToPrompt, pickMotion, pickParticles, uid } from '@/lib/promptEngine';
import { buildImageUrl } from '@/lib/imageGen';
import { useProject } from '@/lib/projectContext';

interface Props {
  onGenerationStart: () => void;
  onGenerationComplete: (frames: SceneFrame[]) => void;
}

export default function ScriptPanel({ onGenerationStart, onGenerationComplete }: Props) {
  const { activeProject, updateScript, createProject, setFrames } = useProject();
  const [selectedGenre, setSelectedGenre] = useState<Genre>(
    (activeProject?.genre as Genre) ?? 'shonen-battle',
  );
  const [script, setScript] = useState(activeProject?.script ?? '');
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [frameDuration, setFrameDuration] = useState(5);
  const [genStatus, setGenStatus] = useState('');

  // Sync local state when active project changes
  useEffect(() => {
    if (activeProject) {
      setScript(activeProject.script);
      setSelectedGenre((activeProject.genre as Genre) || 'shonen-battle');
    } else {
      setScript('');
      setSelectedGenre('shonen-battle');
    }
    setGenStatus('');
  }, [activeProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyTemplate(genre: Genre) {
    const template = getTemplate(genre);
    setSelectedGenre(genre);
    setScript(template.script);
    if (activeProject) {
      updateScript(activeProject.id, template.script);
    }
  }

  function handleScriptChange(value: string) {
    setScript(value);
    if (activeProject) {
      updateScript(activeProject.id, value);
    }
  }

  async function handleGenerate() {
    if (!script.trim() || generating) return;

    setGenerating(true);
    onGenerationStart();
    setGenStatus('Parsing script structure...');

    const scenes = parseScript(script);
    if (scenes.length === 0) {
      setGenerating(false);
      setGenStatus('No scenes found. Add "SCENE 1 — TITLE" headers.');
      return;
    }

    // Ensure a project exists before saving frames
    let projectId = activeProject?.id;
    if (!projectId) {
      projectId = createProject('Untitled Project', selectedGenre, script);
    }

    setGenStatus(`Generating ${scenes.length} cinematic frames...`);

    const frames: SceneFrame[] = scenes.map((scene, i) => {
      const prompt = sceneToPrompt(scene, selectedGenre);
      const motion = pickMotion(scene, selectedGenre) as SceneFrame['motion'];
      const particles = pickParticles(selectedGenre) as SceneFrame['particles'];

      const audioText = scene.lines
        .map((l) => (l.speaker ? `${l.speaker}: ${l.text}` : l.text))
        .join('\n');

      const speaker = scene.lines.find((l) => l.speaker)?.speaker ?? null;

      return {
        id: uid(),
        prompt,
        imageUrl: buildImageUrl(prompt, selectedGenre, Math.floor(Math.random() * 99999) + i * 1000),
        caption: scene.title,
        duration: frameDuration,
        motion,
        particles,
        audioText,
        speaker,
      };
    });

    await new Promise((r) => setTimeout(r, 800));
    setGenStatus('Frames ready! Loading images...');
    setFrames(projectId, frames);
    setGenerating(false);
    onGenerationComplete(frames);
  }

  const sceneCount = parseScript(script).length;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto scroll-thin animate-slide-up">
      {/* Template Picker */}
      <div>
        <h3 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          <Sparkles size={11} className="text-violet-400/70" /> 1-Click Script Templates
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {SCRIPT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className={`group relative overflow-hidden rounded-lg border px-3 py-3 text-center transition-all ${
                selectedGenre === t.id
                  ? 'border-violet-400/40 bg-violet-400/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {selectedGenre === t.id && (
                <div
                  className="absolute inset-x-0 -bottom-px h-0.5"
                  style={{ background: `linear-gradient(to right, ${t.accent}, transparent)`, boxShadow: `0 0 8px ${t.accent}80` }}
                />
              )}
              <div className="text-lg">{t.icon}</div>
              <div className="mt-1 text-[10px] font-medium text-zinc-300">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Script Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <FileText size={11} className="text-violet-400/70" /> Script Editor
          </h3>
          <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-600">
            {sceneCount > 0 && (
              <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-400/80">
                {sceneCount} scene{sceneCount !== 1 ? 's' : ''}
              </span>
            )}
            <span>{script.length} chars</span>
          </div>
        </div>
        <textarea
          value={script}
          onChange={(e) => handleScriptChange(e.target.value)}
          placeholder={'SCENE 1 — OPENING\n[Setting: Describe the scene...]\nCHARACTER: Your dialogue here.\nNARRATOR: Narration text.'}
          className="flex-1 resize-none rounded-lg border border-white/[0.06] bg-onyx/60 p-3.5 font-mono text-[12px] leading-relaxed text-zinc-200 outline-none transition focus:border-violet-400/30 focus:ring-1 focus:ring-violet-400/20"
          style={{ minHeight: '280px' }}
          spellCheck={false}
        />
      </div>

      {/* Advanced Settings Accordion */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/40">
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          <span className="flex items-center gap-1.5">
            <Wand2 size={12} className="text-violet-400/50" /> Advanced Settings
          </span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showAdvanced && (
          <div className="space-y-3 border-t border-white/[0.04] p-3.5 animate-fade-in">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span className="font-medium uppercase tracking-wide text-zinc-500">Frame Duration</span>
                <span className="font-mono text-violet-400/80">{frameDuration}s</span>
              </div>
              <input
                type="range"
                min="2" max="10"
                value={frameDuration}
                onChange={(e) => setFrameDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px #34d399' }} />
              <span>Style keys auto-applied: Ufotable, KyoAni, Wit Studio</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 4px #22d3ee' }} />
              <span>Negative prompts enforced for quality</span>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!script.trim() || generating}
        className="group relative w-full overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-600/20 px-6 py-4 font-bold text-white transition-all hover:from-violet-600/30 hover:via-indigo-600/30 hover:to-cyan-600/30 disabled:cursor-not-allowed disabled:opacity-30"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <span
          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-0"
          style={{ boxShadow: '0 0 24px 4px rgba(139,92,246,0.3), inset 0 0 12px 2px rgba(99,102,241,0.1)' }}
        />
        <span className="relative flex items-center justify-center gap-2.5 text-sm tracking-wide">
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              GENERATING ALPHA ANIME...
            </>
          ) : (
            <>
              <Wand2 size={18} className="text-violet-300" />
              GENERATE ALPHA ANIME
            </>
          )}
        </span>
        {genStatus && (
          <span className="relative mt-1 block text-[10px] font-mono font-normal text-zinc-500">{genStatus}</span>
        )}
      </button>

      {/* Save indicator */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-600">
        <Save size={10} />
        {activeProject ? 'Auto-saved to your device' : 'Create a project on first generate'}
      </div>
    </div>
  );
}
