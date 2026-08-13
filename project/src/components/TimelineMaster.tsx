import { useRef, useState } from 'react';
import { GripVertical, Clock, Waves, Tag, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { SceneFrame } from '@/types';

interface Props {
  frames: SceneFrame[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDelete: (index: number) => void;
}

const MOTION_LABELS: Record<string, string> = {
  'ken-burns-in': 'Zoom In',
  'ken-burns-out': 'Zoom Out',
  'pan-left': 'Pan Left',
  'pan-right': 'Pan Right',
  'pan-up': 'Pan Up',
  'shake': 'Shake',
  'static': 'Static',
};

const PARTICLE_LABELS: Record<string, string> = {
  'none': '—',
  'cherry-blossom': 'Sakura',
  'embers': 'Embers',
  'lens-flare': 'Flare',
  'rain': 'Rain',
  'snow': 'Snow',
};

export default function TimelineMaster({ frames, activeIndex, onSelect, onReorder, onDelete }: Props) {
  const dragIndex = useRef<number>(-1);
  const [dragOver, setDragOver] = useState<number>(-1);

  if (frames.length === 0) {
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/[0.06] bg-obsidian/20 px-6 text-center">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" aria-hidden />
        <div className="relative animate-fade-in">
          <Waves size={20} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-xs font-medium text-zinc-500">Storyboard Timeline</p>
          <p className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-zinc-600">
            Generated scenes appear here. Drag to reorder, click to preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden rounded-lg border border-white/[0.04] bg-obsidian/40">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          <Waves size={11} className="text-cyan-400/60" /> Storyboard Timeline
        </h3>
        <span className="font-mono text-[9px] text-zinc-600">{frames.length} clips · {frames.reduce((s, f) => s + f.duration, 0)}s total</span>
      </div>

      {/* Frame strip — horizontal scroll */}
      <div className="flex flex-1 gap-2 overflow-x-auto overflow-y-hidden scroll-thin px-3 pb-3">
        {frames.map((frame, i) => (
          <div
            key={frame.id}
            draggable
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
            onDragLeave={() => setDragOver(-1)}
            onDrop={() => {
              if (dragIndex.current >= 0 && dragIndex.current !== i) onReorder(dragIndex.current, i);
              dragIndex.current = -1;
              setDragOver(-1);
            }}
            onClick={() => onSelect(i)}
            className={`group relative flex h-full shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all ${
              activeIndex === i
                ? 'border-violet-400/50 bg-violet-400/5'
                : dragOver === i
                  ? 'border-cyan-400/40 bg-cyan-400/5'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
            }`}
            style={{
              width: '180px',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: dragOver === i && dragIndex.current >= 0 ? 0.5 : 1,
            }}
          >
            {/* Drag handle */}
            <div className="absolute left-1 top-1 z-10 opacity-0 transition group-hover:opacity-100">
              <GripVertical size={12} className="text-zinc-500" />
            </div>

            {/* Thumbnail */}
            <div className="relative h-16 w-full overflow-hidden bg-onyx">
              {frame.imageUrl ? (
                <img
                  src={frame.imageUrl}
                  alt={frame.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <ImageIcon size={16} className="text-zinc-700" />
                </div>
              )}
              {/* Scene number badge */}
              <div className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-300 backdrop-blur">
                {String(i + 1).padStart(2, '0')}
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[8px] text-zinc-300 backdrop-blur">
                <Clock size={8} /> {frame.duration}s
              </div>
              {/* Active indicator bar */}
              {activeIndex === i && (
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-violet-400 to-cyan-400"
                  style={{ boxShadow: '0 0 6px 1px rgba(139,92,246,0.5)' }}
                />
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-col gap-1 px-2 py-1.5">
              <p className="truncate text-[10px] font-medium text-zinc-300">{frame.caption}</p>
              <div className="flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[8px] text-zinc-500">
                  <Tag size={7} /> {MOTION_LABELS[frame.motion] ?? frame.motion}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[8px] text-zinc-500">
                  <Waves size={7} /> {PARTICLE_LABELS[frame.particles] ?? frame.particles}
                </span>
              </div>
              {/* Mini waveform mock */}
              <div className="mt-0.5 flex items-end gap-px h-3">
                {Array.from({ length: 20 }).map((_, wi) => {
                  const seed = (frame.id.charCodeAt(0) + wi) % 7;
                  const heights = [40, 60, 30, 80, 50, 70, 20];
                  return (
                    <div
                      key={wi}
                      className="w-px flex-shrink-0 rounded-full"
                      style={{
                        height: `${heights[seed]}%`,
                        background: activeIndex === i ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Delete button on hover */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(i); }}
              className="absolute right-1 top-1 z-10 grid h-5 w-5 place-items-center rounded bg-black/70 text-zinc-400 opacity-0 backdrop-blur transition hover:bg-rose-500/30 hover:text-rose-300 group-hover:opacity-100"
              aria-label="Delete frame"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
