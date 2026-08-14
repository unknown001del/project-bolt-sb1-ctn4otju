import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import VisualCanvas from './VisualCanvas';

export const WorkspaceTabs: React.FC = () => {
  const [tab, setTab] = useState<'code'|'visual'>('visual');
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button onClick={()=>setTab('code')} className={`px-2 py-1 text-xs rounded ${tab==='code' ? 'bg-[#111116] border border-amber-400' : 'bg-[#0d0d12] border border-zinc-800'}`}>Code Editor</button>
        <button onClick={()=>setTab('visual')} className={`px-2 py-1 text-xs rounded ${tab==='visual' ? 'bg-[#111116] border border-amber-400' : 'bg-[#0d0d12] border border-zinc-800'}`}>Visual Canvas</button>
      </div>
      <div>
        {tab==='code' ? <CodeEditor /> : <VisualCanvas />}
      </div>
    </div>
  );
};

export default WorkspaceTabs;
