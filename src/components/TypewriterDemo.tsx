import React, { useEffect, useState } from 'react';

const SAMPLE_CODE = `import React from 'react';

export default function Hello() {
  return (
    <div className="p-6 bg-[#050507] rounded">
      <h1 className="text-2xl font-bold">Hello from Nova</h1>
      <p className="text-sm text-zinc-400">This is a live demo of the Nova builder.</p>
    </div>
  );
}
`;

export const TypewriterDemo: React.FC<{ speed?: number }> = ({ speed = 24 }) => {
  const [text, setText] = useState('');
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setText((t) => SAMPLE_CODE.slice(0, i));
      i++;
      if (i > SAMPLE_CODE.length) {
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [speed]);

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black">
      <div className="px-3 py-2 bg-[#0b0b0d] flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <div className="ml-4 text-xs text-zinc-400">localhost:5173</div>
      </div>
      <pre className="p-4 text-xs font-mono text-zinc-300 h-64 overflow-auto whitespace-pre-wrap">{text}</pre>
    </div>
  );
};

export default TypewriterDemo;
