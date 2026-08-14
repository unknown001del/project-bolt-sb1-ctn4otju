import React, { useEffect, useRef, useState } from 'react';

export type CanvasNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'button' | 'card' | 'frame';
};

function makeDefaultNodes(): CanvasNode[] {
  return [
    { id: 'n1', x: 40, y: 40, w: 180, h: 48, type: 'button' },
    { id: 'n2', x: 40, y: 120, w: 320, h: 160, type: 'card' }
  ];
}

export const VisualCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>(makeDefaultNodes());
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (dragRef.current) {
        const d = dragRef.current;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        setNodes(prev => prev.map(n => n.id === d.id ? { ...n, x: Math.max(0, d.nodeX + dx), y: Math.max(0, d.nodeY + dy) } : n));
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        setNodes(prev => prev.map(n => n.id === r.id ? { ...n, w: Math.max(24, r.startW + dx), h: Math.max(24, r.startH + dy) } : n));
      }
    };
    const onPointerUp = () => { dragRef.current = null; resizeRef.current = null; };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); };
  }, []);

  const onPointerDownNode = (e: React.PointerEvent, node: CanvasNode) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveId(node.id);
    dragRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, nodeX: node.x, nodeY: node.y };
  };

  const onPointerDownResize = (e: React.PointerEvent, node: CanvasNode) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    resizeRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, startW: node.w, startH: node.h };
  };

  const addNode = (type: CanvasNode['type']) => {
    const id = 'n' + (Math.random().toString(36).slice(2, 9));
    setNodes(prev => [...prev, { id, x: 60, y: 60, w: 200, h: 80, type }]);
  };

  const generateCode = () => {
    // Produce two variants: 1) idiomatic responsive Tailwind (flex-based) and 2) percentage-positioned layout
    const containerW = 800; // design-time canvas width used to compute percentages
    const containerH = 500;

    // Responsive flex-based: render nodes in visual order into rows based on y coordinate
    const rows: CanvasNode[][] = [];
    const sorted = [...nodes].sort((a,b)=> a.y - b.y || a.x - b.x);
    for (const n of sorted) {
      const row = rows.find(r => Math.abs(r[0].y - n.y) < 80);
      if (row) row.push(n); else rows.push([n]);
    }

    const flexParts = rows.map((r, ri) => {
      const cols = r.map(n => {
        const wPct = Math.max(5, Math.round((n.w / containerW) * 100));
        // Use inline flex basis style for idiomatic responsive layout
        if (n.type === 'button') {
          return `          <div style={{flex: '0 0 ${wPct}%'}} className=\"min-w-0\">\n            <button className=\"w-full rounded-md bg-[#FF6B00] text-black font-bold py-2\">Button</button>\n          </div>`;
        }
        if (n.type === 'card') {
          return `          <div style={{flex: '0 0 ${wPct}%'}} className=\"min-w-0\">\n            <div className=\"p-3 bg-[#0b0b0d] rounded-lg border border-zinc-800\">\n              <h3 className=\"text-sm font-bold\">Card Title</h3>\n              <p className=\"text-xs text-zinc-400\">Card content</p>\n            </div>\n          </div>`;
        }
        return `          <div style={{flex: '0 0 ${wPct}%'}} className=\"min-w-0\">\n            <div className=\"p-2 bg-[#0b0b0d] border border-zinc-800\">Frame</div>\n          </div>`;
      }).join('\n');
      return `        <div className=\"flex gap-2 mb-3\">\n${cols}\n        </div>`;
    }).join('\n');

    const flexCode = `import React from 'react';\n\nexport default function VisualResponsive(){\n  return (\n    <div className=\"w-full max-w-[${containerW}px]\">\n${flexParts}\n    </div>\n  );\n}\n`;

    // Percentage-positioned layout using Tailwind arbitrary values for left/top/width/height
    const absParts = nodes.map(n => {
      const xPct = ((n.x / containerW) * 100).toFixed(2);
      const yPct = ((n.y / containerH) * 100).toFixed(2);
      const wPct = ((n.w / containerW) * 100).toFixed(2);
      const hPct = ((n.h / containerH) * 100).toFixed(2);
      const cls = `absolute left-[${xPct}%] top-[${yPct}%] w-[${wPct}%] h-[${hPct}%]`;
      if (n.type === 'button') {
        return `      <button className=\"${cls} rounded-md bg-[#FF6B00] text-black font-bold\">Button</button>`;
      }
      if (n.type === 'card') {
        return `      <div className=\"${cls} p-3 bg-[#0b0b0d] rounded-lg border border-zinc-800\">\n        <h3 className=\"text-sm font-bold\">Card Title</h3>\n        <p className=\"text-xs text-zinc-400\">Card content</p>\n      </div>`;
      }
      return `      <div className=\"${cls} bg-[#0b0b0d] border border-zinc-800\">Frame</div>`;
    }).join('\n');

    const absCode = `import React from 'react';\n\nexport default function VisualPreview(){\n  return (\n    <div className=\"relative w-full max-w-[${containerW}px] h-[${containerH}px]\">\n${absParts}\n    </div>\n  );\n}\n`;

    // Combine into single code with both variants and a brief note
    return `/* Responsive Tailwind (flex) variant - preferred for production */\n\n${flexCode}\n/* Absolute-percentage variant - mirrors canvas positions using percentage-based classes */\n\n${absCode}`;
  };

  const code = generateCode();

  useEffect(() => {
    // Log generated code to the browser console whenever nodes change (for testing/human review)
    console.log('VisualCanvas generated code:\n', code);
  }, [code]);

  return (
    <div className="flex h-full gap-4">
      <div className="w-1/2 bg-[#070708] rounded border border-zinc-800 p-3 overflow-auto">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => addNode('button')} className="px-2 py-1 text-xs border border-zinc-800 rounded">Add Button</button>
          <button onClick={() => addNode('card')} className="px-2 py-1 text-xs border border-zinc-800 rounded">Add Card</button>
          <button onClick={() => setNodes(makeDefaultNodes())} className="px-2 py-1 text-xs border border-zinc-800 rounded">Reset</button>
          <button onClick={() => {
            // Programmatic test: move n1 by +60x, +30y and resize n2 larger
            setNodes(prev => prev.map(n => n.id === 'n1' ? { ...n, x: n.x + 60, y: n.y + 30 } : n.id === 'n2' ? { ...n, w: n.w + 80, h: n.h + 30 } : n));
            // Also toggle active id to force re-render
            setActiveId(null);
            setTimeout(()=>setActiveId('n1'), 120);
          }} className="px-2 py-1 text-xs border border-amber-400 rounded bg-[#111116]">Run Test</button>
        </div>
        <div ref={containerRef} className="relative bg-[#0b0b0d] w-full h-[500px] rounded overflow-hidden border border-zinc-800">
          {nodes.map(n => (
            <div
              key={n.id}
              onPointerDown={(e) => onPointerDownNode(e, n)}
              style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
              className={`absolute select-none ${activeId === n.id ? 'ring-2 ring-amber-400' : ''}`}>
              <div className="w-full h-full p-2">
                {n.type === 'button' ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#FF6B00] text-black font-bold rounded">Button</div>
                ) : n.type === 'card' ? (
                  <div className="w-full h-full p-2 bg-[#0b0b0d] rounded border border-zinc-800 text-zinc-200">
                    <div className="font-bold">Card</div>
                    <div className="text-xs text-zinc-400">Content</div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#0b0b0d]" />
                )}
              </div>
              {/* resize handle */}
              <div onPointerDown={(e) => onPointerDownResize(e, n)} className="absolute right-0 bottom-0 w-3 h-3 bg-amber-500/80 cursor-se-resize" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2 bg-[#040405] rounded border border-zinc-800 p-2">
        <div className="text-xs text-zinc-400 mb-2">Generated React + Tailwind Preview</div>
        <div className="h-[520px] bg-[#070708] rounded border border-zinc-800 overflow-hidden">
          <Editor height="100%" defaultLanguage="typescript" value={code} options={{ readOnly: true, minimap: { enabled: false } }} />
        </div>
      </div>
    </div>
  );
};

export default VisualCanvas;
