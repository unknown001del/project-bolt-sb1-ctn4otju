import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Mic, MicOff, Maximize2, Film, Clapperboard,
} from 'lucide-react';
import type { SceneFrame } from '@/types';
import { MotionEngine } from '@/lib/motionEngine';
import { ttsEngine } from '@/lib/tts';

interface Props {
  frames: SceneFrame[];
  activeFrameIndex: number;
  onFrameChange: (index: number) => void;
}

export default function CinemaPlayer({ frames, activeFrameIndex, onFrameChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MotionEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentFrame = frames[activeFrameIndex] ?? null;
  const totalDuration = frames.reduce((s, f) => s + f.duration, 0);

  // Initialize motion engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new MotionEngine(canvasRef.current);
    engineRef.current = engine;
    return () => { engine.stop(); };
  }, []);

  // Scene change — update engine
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !currentFrame) return;
    setImageLoaded(false);
    engine.setScene(currentFrame.imageUrl, currentFrame.motion, currentFrame.particles, currentFrame.duration * 1000);
    if (playing) engine.start();

    // Preload image
    if (currentFrame.imageUrl) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
      img.src = currentFrame.imageUrl;
    }
  }, [activeFrameIndex, currentFrame?.imageUrl]); // eslint-disable-line

  // Playback loop
  useEffect(() => {
    if (!playing) {
      engineRef.current?.stop();
      return;
    }
    engineRef.current?.start();
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      setElapsed((e) => {
        const next = e + dt;
        const frameDur = currentFrame?.duration ?? 5;
        if (next >= frameDur) {
          // Advance to next frame
          if (activeFrameIndex < frames.length - 1) {
            onFrameChange(activeFrameIndex + 1);
            return 0;
          } else {
            setPlaying(false);
            return 0;
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, activeFrameIndex, frames.length, currentFrame?.duration, onFrameChange]);

  // Narration sync
  useEffect(() => {
    if (!playing || !narrating || muted || !currentFrame) {
      if (!narrating || muted) ttsEngine.stop();
      return;
    }
    const lines = currentFrame.audioText
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^([A-Z][A-Z_\s]+?):\s*(.+)$/);
        return { speaker: match ? match[1].trim() : null, text: match ? match[2].trim() : line };
      });
    void ttsEngine.speakLines(lines);
  }, [activeFrameIndex, playing, narrating, muted, currentFrame?.audioText]); // eslint-disable-line

  // Stop TTS when not playing
  useEffect(() => {
    if (!playing) ttsEngine.stop();
  }, [playing]);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      ttsEngine.stop();
    } else {
      if (activeFrameIndex >= frames.length - 1 && elapsed >= (currentFrame?.duration ?? 5)) {
        setElapsed(0);
        onFrameChange(0);
      }
      setPlaying(true);
    }
  }, [playing, activeFrameIndex, frames.length, elapsed, currentFrame?.duration, onFrameChange]);

  const skip = useCallback((dir: -1 | 1) => {
    setElapsed(0);
    const next = activeFrameIndex + dir;
    if (next >= 0 && next < frames.length) onFrameChange(next);
  }, [activeFrameIndex, frames.length, onFrameChange]);

  const toggleNarration = useCallback(() => {
    setNarrating((n) => {
      if (n) ttsEngine.stop();
      return !n;
    });
  }, []);

  const fullscreen = useCallback(() => {
    containerRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); skip(-1); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); skip(1); }
      else if (e.code === 'KeyM') { e.preventDefault(); setMuted((m) => !m); }
      else if (e.code === 'KeyN') { e.preventDefault(); toggleNarration(); }
      else if (e.code === 'KeyF') { e.preventDefault(); fullscreen(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, skip, toggleNarration, fullscreen]);

  // Compute global elapsed time
  const globalElapsed = frames.slice(0, activeFrameIndex).reduce((s, f) => s + f.duration, 0) + elapsed;
  const progressPct = totalDuration > 0 ? (globalElapsed / totalDuration) * 100 : 0;

  if (frames.length === 0) {
    return (
      <div className="relative grid h-full place-items-center overflow-hidden rounded-xl border border-dashed border-white/[0.06] bg-obsidian/20">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-50" aria-hidden />
        <div className="relative text-center animate-fade-in">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.06] bg-obsidian/60">
            <Clapperboard className="text-zinc-600" size={28} />
          </div>
          <p className="font-display text-sm font-semibold text-zinc-400">Cinema Theater Awaiting Content</p>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-zinc-600">
            Choose a script template, write your scenes, then hit Generate to preview your anime.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-700">
            <Film size={10} /> 16:9 · Canvas2D · Ken Burns Motion
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col gap-3">
      {/* Canvas Viewport — 16:9 */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-black shadow-2xl"
        style={{ boxShadow: '0 0 30px 0 rgba(99,102,241,0.08)' }}>
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: 'block' }} />

        {/* Loading overlay */}
        {currentFrame?.imageUrl && !imageLoaded && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                <div className="absolute inset-2 animate-pulse rounded-full bg-violet-500/20" />
              </div>
              <p className="font-mono text-[11px] text-zinc-400">Loading high-fidelity frame...</p>
            </div>
          </div>
        )}

        {/* Scene chip — top left */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-md bg-black/60 px-2.5 py-1 font-mono text-[11px] text-zinc-300 backdrop-blur">
            SCN {String(activeFrameIndex + 1).padStart(2, '0')}/{String(frames.length).padStart(2, '0')}
          </span>
          {currentFrame && (
            <span className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-zinc-300 backdrop-blur">
              {currentFrame.caption}
            </span>
          )}
        </div>

        {/* Timecode — top right */}
        <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 font-mono text-[11px] text-cyan-300 backdrop-blur">
          {formatTC(globalElapsed)} / {formatTC(totalDuration)}
        </div>

        {/* Caption / subtitle */}
        {currentFrame?.audioText && playing && (
          <div className="absolute inset-x-0 bottom-[10%] grid place-items-center px-6">
            <div className="max-w-xl rounded-lg bg-black/50 px-4 py-2 backdrop-blur">
              <p className="text-center text-sm text-white/90" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {currentLine(currentFrame.audioText, elapsed, currentFrame.duration)}
              </p>
            </div>
          </div>
        )}

        {/* Center play overlay when paused */}
        {!playing && (
          <button onClick={togglePlay} className="group absolute inset-0 grid place-items-center">
            <div
              className="grid h-16 w-16 place-items-center rounded-full bg-black/40 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-500/80"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <Play size={26} className="ml-1 text-white" fill="currentColor" />
            </div>
          </button>
        )}

        {/* AI processing indicator */}
        {playing && narrating && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur">
            <Mic size={11} className="text-violet-400" />
            <span className="font-mono text-[9px] text-violet-300">AI VOICE ACTIVE</span>
          </div>
        )}
      </div>

      {/* Pro Control Bar */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/60 px-4 py-3 backdrop-blur">
        {/* Timeline scrubber */}
        <div
          className="group relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/[0.06]"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const targetTime = pct * totalDuration;
            let acc = 0;
            for (let i = 0; i < frames.length; i++) {
              if (targetTime < acc + frames[i].duration) {
                onFrameChange(i);
                setElapsed(targetTime - acc);
                break;
              }
              acc += frames[i].duration;
            }
          }}
        >
          {frames.map((f, i) => {
            const start = frames.slice(0, i).reduce((s, x) => s + x.duration, 0);
            return (
              <div key={f.id} className="absolute top-0 h-full w-px bg-white/10" style={{ left: `${(start / totalDuration) * 100}%` }} />
            );
          })}
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400"
            style={{ width: `${progressPct}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            style={{ left: `${progressPct}%`, boxShadow: '0 0 8px 2px rgba(139,92,246,0.5)' }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => skip(-1)} className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition hover:bg-white/[0.06] hover:text-white" aria-label="Previous">
            <SkipBack size={16} />
          </button>
          <button
            onClick={togglePlay}
            className="grid h-9 w-9 place-items-center rounded-full bg-violet-500 text-white transition hover:bg-violet-400 active:scale-90"
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: playing ? '0 0 12px 2px rgba(139,92,246,0.4)' : 'none' }}
            aria-label="Play/pause"
          >
            {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} className="ml-0.5" fill="currentColor" />}
          </button>
          <button onClick={() => skip(1)} className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition hover:bg-white/[0.06] hover:text-white" aria-label="Next">
            <SkipForward size={16} />
          </button>

          <span className="ml-2 font-mono text-[11px] tabular-nums text-zinc-500">
            {formatTC(globalElapsed)} / {formatTC(totalDuration)}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={toggleNarration}
              className={`grid h-8 w-8 place-items-center rounded-md transition ${narrating ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'}`}
              aria-label="AI Narration" title="AI Voice Narration (N)"
            >
              {narrating ? <Mic size={15} /> : <MicOff size={15} />}
            </button>
            <button onClick={() => setMuted((m) => !m)} className={`grid h-8 w-8 place-items-center rounded-md transition ${muted ? 'bg-rose-500/15 text-rose-400' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'}`} aria-label="Mute" title="Mute (M)">
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button onClick={fullscreen} className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition hover:bg-white/[0.06] hover:text-white" aria-label="Fullscreen">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function currentLine(audioText: string, elapsed: number, duration: number): string {
  const lines = audioText.split('\n').filter(Boolean);
  if (lines.length === 0) return '';
  const per = duration / lines.length;
  const idx = Math.min(lines.length - 1, Math.floor(elapsed / per));
  const line = lines[idx];
  const match = line.match(/^([A-Z][A-Z_\s]+?):\s*(.+)$/);
  return match ? match[2].trim() : line;
}

function formatTC(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(cs).padStart(2, '0')}`;
}
