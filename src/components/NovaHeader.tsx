import React from 'react';

export const NovaHeader: React.FC = ()=> (
  <header className="h-14 bg-[#0d0d12] border-b border-zinc-800 flex items-center justify-between px-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ff] to-[#FF6B00] flex items-center justify-center shadow-lg">N</div>
      <div className="text-sm font-black font-mono tracking-widest uppercase">NOVA <span className="text-[#FF6B00]">STUDIO</span></div>
    </div>
  </header>
);

export default NovaHeader;
