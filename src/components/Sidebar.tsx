import React from 'react';
import { FileText, Database, Zap, Users, Settings } from 'lucide-react';

export const Sidebar: React.FC<{ active: string; setActive: (s: string) => void }> = ({ active, setActive }) => {
  const items = [
    { id: 'explorer', icon: FileText, label: 'Code Explorer' },
    { id: 'schema', icon: Database, label: 'Visual Schema' },
    { id: 'ai', icon: Zap, label: 'AI Production Hub' },
    { id: 'team', icon: Users, label: 'Team' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <>
      <div className="hidden md:flex w-16 bg-[#0b0b0d] border-r border-zinc-800 flex-col items-center py-4 gap-3">
        {items.map(it => (
          <button key={it.id} onClick={() => setActive(it.id)} className={`w-12 h-12 rounded-lg flex items-center justify-center ${active===it.id? 'bg-[#121216] border border-zinc-700' : 'hover:bg-[#0f0f11]'}`} title={it.label}>
            <it.icon className="w-5 h-5 text-zinc-200" />
          </button>
        ))}
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0b0b0d] border-t border-zinc-800 flex items-center justify-around">
        {items.map(it => (
          <button key={it.id} onClick={() => setActive(it.id)} className={`flex flex-col items-center text-xs ${active===it.id ? 'text-amber-400' : 'text-zinc-400'}`} title={it.label}>
            <it.icon className="w-5 h-5" />
            <span className="text-[10px]">{it.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </>
  );
};
