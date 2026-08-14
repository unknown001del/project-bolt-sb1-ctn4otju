import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

export const TerminalDock: React.FC = () => {
  const [logs, setLogs] = useState<string[]>(['Welcome to Nova Terminal']);
  const [input, setInput] = useState('');

  const append = (line: string) => setLogs(l=>[...l,line]);

  const run = (cmd: string) => {
    append(`$ ${cmd}`);
    if (cmd.startsWith('npm run dev')) {
      append('Starting dev server...');
      append('Compiled successfully in 1223ms');
    } else if (cmd.startsWith('npm run build')) {
      append('Building for production...');
      append('Assets optimized. Total size: 2.3MB');
    } else if (cmd.startsWith('git push')) {
      append('Pushing to remote...');
      append('Upload complete. 1 files changed.');
    } else if (cmd.startsWith('clear')) {
      setLogs([]);
      return;
    } else {
      append('Command simulated: ' + cmd);
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input) return;
    run(input);
    setInput('');
  };

  return (
    <div className="w-full bg-[#060607] border-t border-zinc-800 p-3 font-mono text-[12px]">
      <div className="flex items-center gap-2 mb-2">
        <Terminal className="w-4 h-4 text-zinc-300" />
        <div className="text-xs text-zinc-400">Terminal Dock</div>
      </div>
      <div className="bg-[#080808] p-3 rounded-md h-36 overflow-auto border border-zinc-900">
        {logs.map((l,i)=> <div key={i} className="text-zinc-300">{l}</div>)}
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Run command (npm run dev | npm run build | git push)" className="flex-1 bg-[#0b0b0d] border border-zinc-800 rounded-md p-2" />
        <button className="px-3 py-2 bg-[#FF6B00] text-black rounded-md">Run</button>
      </form>
    </div>
  );
};
