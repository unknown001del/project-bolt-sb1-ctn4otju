import React from 'react';
import { useFileSystem } from '../context/FileSystemContext';

export const FileSystemMirror: React.FC = () => {
  const fs = useFileSystem();

  const bind = async () => {
    try {
      await fs.bind();
      // create sample file to show binding succeeded
      await fs.writeFile('nova-mirror-readme.txt', 'Nova Mirror Active - Local hard drive binding established');
    } catch (e) {
      console.error(e);
      alert('Unable to bind directory: ' + ((e as Error).message || e));
    }
  };

  return (
    <div className="p-3 bg-[#0a0a0b] border border-zinc-800 rounded-md">
      <h4 className="text-xs font-mono font-bold text-zinc-300">Mirror Local Hard Drive</h4>
      <p className="text-[11px] text-zinc-400 mt-2">Bind NOVA to a local folder to read/write code directly with the File System Access API.</p>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={bind} className="bg-[#FF6B00] px-3 py-2 rounded-md text-black">Mirror Local Hard Drive</button>
        <div className="text-[12px] text-zinc-400">{fs.bound ? `Bound: ${fs.name}` : 'No binding'}</div>
      </div>
    </div>
  );
};
