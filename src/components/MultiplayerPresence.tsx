import React, { useEffect, useState } from 'react';

const sample = [
  { name: 'Alex', role: 'AI Specialist', color: '#34d399' },
  { name: 'Sarah', role: 'DB Lead', color: '#60a5fa' }
];

export const MultiplayerPresence: React.FC = () => {
  const [cursors, setCursors] = useState(sample.map((s,i)=>({ ...s, x: 20 + i*40, y: 20 + i*20 })));

  useEffect(()=>{
    const id = setInterval(()=>{
      setCursors(prev=> prev.map(p=> ({ ...p, x: (p.x + (Math.random()*10-5)) , y: (p.y + (Math.random()*6-3)) }))); 
    }, 800);
    return ()=> clearInterval(id);
  },[]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {sample.map(s=> (
          <div key={s.name} className="flex items-center gap-2 bg-[#0b0b0d] border border-zinc-800 px-2 py-1 rounded-md">
            <div style={{ background: s.color }} className="w-6 h-6 rounded-full flex items-center justify-center text-black font-bold">{s.name[0]}</div>
            <div className="text-xs text-zinc-300 font-mono">{s.name}</div>
          </div>
        ))}
      </div>

      {/* floating cursors preview */}
      <div className="absolute inset-0 pointer-events-none">
        {cursors.map(c=> (
          <div key={c.name} style={{ left: c.x, top: c.y }} className="absolute">
            <div style={{ background: c.color }} className="px-2 py-1 rounded-md text-black text-[11px] font-mono">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
