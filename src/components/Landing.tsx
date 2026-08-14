import React from 'react';
import NovaLayout from './NovaLayout';

export const Landing: React.FC<{ note?: string }> = ({ note }) => (
  <NovaLayout>
    <div className="p-6 bg-[#0b0b0d] rounded-xl border border-zinc-800">
      <h1 className="text-2xl font-mono font-bold text-zinc-100">Welcome to NOVA Studio</h1>
      <p className="text-zinc-400 mt-2">Starter app generated from plan:</p>
      {note && <pre className="mt-2 p-2 bg-[#050507] rounded text-xs text-zinc-300">{note}</pre>}
    </div>
  </NovaLayout>
);

export default Landing;
