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
    <div className="w-16 bg-[#0b0b0d] border-r border-zinc-800 flex flex-col items-center py-4 gap-3">
      {items.map(it => (
        <button key={it.id} onClick={() => setActive(it.id)} className={`w-12 h-12 rounded-lg flex items-center justify-center ${active===it.id? 'bg-[#121216] border border-zinc-700' : 'hover:bg-[#0f0f11]'}`} title={it.label}>
          <it.icon className="w-5 h-5 text-zinc-200" />
        </button>
      ))}
    </div>
  );
};
