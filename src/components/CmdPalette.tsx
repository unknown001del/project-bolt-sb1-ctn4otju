import React, { useEffect, useState } from 'react';

const ACTIONS = [
  { id: 'new', title: 'Create new project' },
  { id: 'templates', title: 'Open templates' },
  { id: 'deploy', title: 'Deploy to Vercel' },
  { id: 'export', title: 'Export code' },
  { id: 'open-workspace', title: 'Open workspace' },
];

export const CmdPalette: React.FC<{ open: boolean; onClose: () => void; onAction: (id: string) => void }> = ({ open, onClose, onAction }) => {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) { setQuery(''); setIndex(0); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { setIndex(i => Math.min(i+1, ACTIONS.length-1)); e.preventDefault(); }
      if (e.key === 'ArrowUp') { setIndex(i => Math.max(i-1, 0)); e.preventDefault(); }
      if (e.key === 'Enter') { onAction(filtered[index]?.id); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index]);

  const filtered = ACTIONS.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0b0b0d] border border-zinc-800 rounded-xl p-3">
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a command or search..." className="w-full p-3 bg-[#070708] rounded text-sm border border-zinc-800" />
        <div className="mt-2 max-h-64 overflow-auto">
          {filtered.map((a, i) => (
            <div key={a.id} onClick={() => onAction(a.id)} className={`p-2 rounded cursor-pointer ${i===index ? 'bg-[#111116] text-white' : 'text-zinc-300'}`}>
              {a.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CmdPalette;
