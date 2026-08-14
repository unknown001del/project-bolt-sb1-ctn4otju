import React, { useEffect, useState } from 'react';
import { PROMPTS } from '../prompts';

export const PreviewWrapper: React.FC<{ url?: string }> = ({ url = 'http://localhost:5173' }) => {
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [status, setStatus] = useState<'loading'|'ready'|'error'|'fixing'>('loading');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setStatus('loading');
    const t = setTimeout(() => setStatus('error'), 3500); // if not loaded quickly, show fallback
    return () => clearTimeout(t);
  }, [url]);

  const onLoad = () => setStatus('ready');
  const onError = () => {
    setStatus('error');
  };

  const tryFix = () => {
    setStatus('fixing');
    setTimeout(() => {
      setAttempts(a => a + 1);
      // simulate attempted auto-fix; if attempts < 2 go back to loading, else show fallback
      if (attempts < 1) {
        setStatus('loading');
        // try again after a short delay
        setTimeout(() => setStatus('error'), 2500);
      } else {
        setStatus('error');
      }
    }, 1200);
  };

  if (status === 'ready') {
    // compute width by device
    const width = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '390px';
    return (
      <div className="w-full h-[520px] rounded-xl overflow-hidden border border-zinc-800 bg-black p-4 flex flex-col items-center">
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => setDevice('desktop')} className={`px-2 py-1 rounded ${device==='desktop' ? 'bg-[#111116]' : 'bg-[#0d0d12]'}`}>Desktop</button>
          <button onClick={() => setDevice('tablet')} className={`px-2 py-1 rounded ${device==='tablet' ? 'bg-[#111116]' : 'bg-[#0d0d12]'}`}>Tablet</button>
          <button onClick={() => setDevice('mobile')} className={`px-2 py-1 rounded ${device==='mobile' ? 'bg-[#111116]' : 'bg-[#0d0d12]'}`}>Mobile</button>
        </div>
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black" style={{ width }}>
          <iframe src={url} title="Preview" onLoad={onLoad} onError={onError} className="w-full h-[440px]" />
        </div>
      </div>
    );
  }

  if (status === 'loading' || status === 'fixing') {
    return (
      <div className="w-full h-[520px] rounded-xl overflow-hidden border border-zinc-800 bg-[#070708] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-3 text-sm text-zinc-400">{status === 'fixing' ? 'Nova is fixing preview...' : 'Booting preview...'}</div>
          <div className="loader border-4 border-t-4 border-amber-500 rounded-full w-8 h-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // error fallback: always render a non-blank mock feed
  return (
    <div className="w-full h-[520px] rounded-xl overflow-auto border border-zinc-800 bg-[#050507] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-mono text-zinc-300">Fallback Preview — Mock Samples</div>
        <div className="flex items-center gap-2">
          <button onClick={tryFix} className="px-3 py-1 text-xs bg-[#111116] border border-zinc-800 rounded">Try Auto-Fix</button>
          <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 text-xs bg-[#0d0d12] border border-zinc-800 rounded">Open Live</a>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {PROMPTS.slice(0, 9).map((p, i) => (
          <div key={i} className="rounded-md overflow-hidden border border-zinc-800 bg-[#0b0b0d]">
            <img src={`https://picsum.photos/seed/${encodeURIComponent(p).slice(0,10)}/400/240`} alt={`mock-${i}`} className="w-full h-40 object-cover" />
            <div className="p-2 text-xs text-zinc-300">{p.slice(0, 80)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewWrapper;
