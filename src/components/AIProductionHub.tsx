import React, { useState } from 'react';
import { pollinationsImageUrl } from '../utils/pollinations';
import { Image } from 'lucide-react';
import { PROMPTS } from '../prompts';

export const AIProductionHub: React.FC = () => {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const hasApiKey = Boolean((import.meta as any).env?.VITE_GROQ_API_KEY || (import.meta as any).env?.VITE_HUGGINGFACE_API_KEY);

  const genImage = async (usePrompt?: string) => {
    const p = (usePrompt || prompt).trim() || PROMPTS[0];
    setLoading(true);
    try {
      let url: string;
      if (hasApiKey) {
        // Use Pollinations endpoint as a free client-friendly generator when keys are present
        url = pollinationsImageUrl(p + ' cinematic, high quality');
      } else {
        // Fallback to picsum.photos seeded image so preview always works without keys
        const seed = encodeURIComponent(p).slice(0, 50);
        url = `https://picsum.photos/seed/${seed}/800/600`;
      }

      // Prepend to feed
      setImages(prev => [url, ...prev].slice(0, 100));
    } catch (err) {
      console.error('Generate image failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#08080a] rounded-xl border border-zinc-800 overflow-hidden">
      {/* Top: scrollable prompt samples */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-[#070708]">
        <div className="flex gap-2 overflow-x-auto py-1">
          {PROMPTS.slice(0, 20).map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              className={`text-xs px-3 py-1 rounded-md whitespace-nowrap border ${s === prompt ? 'border-amber-400 bg-amber-900/20' : 'border-zinc-800'} text-zinc-200`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Middle: scrollable image feed */}
      <div className="p-3 overflow-auto max-h-48 flex flex-col gap-3 bg-[#0b0b0d]">
        {images.length === 0 && (
          <div className="text-[12px] text-zinc-500">No images yet — generate one with the prompt bar below or click a sample above.</div>
        )}
        {images.map((u, idx) => (
          <div key={idx} className="rounded-md overflow-hidden border border-zinc-800 bg-[#0b0b0d]">
            <img src={u} alt={`gen-${idx}`} className="w-full h-36 object-cover" />
            <div className="p-2 flex items-center justify-between text-[12px] text-zinc-400">
              <div>Source: {hasApiKey ? 'Pollinations / API' : 'picsum.photos (fallback)'}</div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard?.writeText(u)} className="px-2 py-1 text-[11px] border border-zinc-800 rounded">Copy</button>
                <a href={u} target="_blank" rel="noreferrer" className="px-2 py-1 text-[11px] border border-zinc-800 rounded">Open</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky prompt bar at bottom */}
      <div className="p-3 border-t border-zinc-800 bg-[#070708] sticky bottom-0">
        <div className="flex flex-col gap-2">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full p-2 bg-[#0d0d12] border border-zinc-800 rounded-md text-sm h-20" />
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-400">{hasApiKey ? 'Using free AI endpoints' : 'No API key detected — using picsum.photos fallback'}</div>
            <div className="flex gap-2">
              <button onClick={() => { setPrompt(PROMPTS[0]); }} className="px-3 py-2 border border-zinc-800 rounded-md text-xs">Reset</button>
              <button onClick={() => genImage()} disabled={loading} className="px-4 py-2 rounded-md bg-[#FF6B00] text-black font-bold">{loading ? 'Generating...' : 'Generate'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProductionHub;
