import React, { useMemo, useRef, useState, useEffect } from 'react';
import { generatePrismaSchema, TableDef } from '../utils/schemaGenerator';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';

interface NodePos { id: string; x: number; y: number; }

export const DatabaseCanvas: React.FC = () => {
  const fs = useFileSystem();
  const [tables, setTables] = useState<TableDef[]>([
    { name: 'Users', columns: [{ name: 'id', type: 'string', pk: true }, { name: 'email', type: 'string' }] },
    { name: 'Subscriptions', columns: [{ name: 'id', type: 'string', pk: true }, { name: 'userId', type: 'string' }] }
  ]);
  const [nodes, setNodes] = useState<NodePos[]>([{ id: 'Users', x: 80, y: 40 }, { id: 'Subscriptions', x: 360, y: 160 }]);
  const [dragging, setDragging] = useState<string | null>(null);
  const areaRef = useRef<HTMLDivElement | null>(null);

  const onMouseDown = (id: string) => (e: React.MouseEvent) => {
    setDragging(id);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setNodes(prev => prev.map(n => n.id===dragging ? { ...n, x: e.clientX - rect.left - 80, y: e.clientY - rect.top - 20 } : n));
  };
  const onMouseUp = () => setDragging(null);

  const addTable = () => {
    const name = `Table${tables.length+1}`;
    setTables(t=>[...t,{ name, columns:[{ name: 'id', type: 'string', pk: true }]}]);
    setNodes(n=>[...n,{ id: name, x: 100 + n.length*80, y: 100 }]);
  };

  const prisma = useMemo(()=> generatePrismaSchema(tables), [tables]);

  const [writeStatus, setWriteStatus] = useState<'idle'|'writing'|'success'|'error'>('idle');

  // Write schema to the bound mirror immediately when it changes
  useEffect(()=>{
    const write = async () => {
      try {
        if (fs.bound) {
          setWriteStatus('writing');
          await fs.writeFile('src/database/schema.ts', `export const schema = ` + "`" + prisma + "`" + `;`);
          console.log('Wrote schema.ts to mirror');
          setWriteStatus('success');
          setTimeout(()=> setWriteStatus('idle'), 2000);
        }
      } catch (e) {
        console.error('Error writing schema to mirror', e);
        setWriteStatus('error');
      }
    };
    write();
  }, [prisma, fs.bound]);

  return (
    <div className="p-4 bg-[#070708] rounded-xl border border-zinc-800 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-mono font-bold text-zinc-300">Visual Relational Schema Canvas</h3>
          <div>
            {writeStatus === 'writing' && <span className="text-[11px] font-mono text-amber-400 ml-2">Writing schema…</span>}
            {writeStatus === 'success' && <span className="text-[11px] font-mono text-emerald-400 ml-2">Schema saved</span>}
            {writeStatus === 'error' && <span className="text-[11px] font-mono text-red-400 ml-2">Save failed</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addTable} className="px-3 py-2 bg-[#0d0d12] border border-zinc-800 rounded-md flex items-center gap-2 text-sm"><PlusCircle className="w-4 h-4"/> Add Table</button>
        </div>
      </div>

      <div ref={areaRef} onMouseMove={onMouseMove} onMouseUp={onMouseUp} className="relative bg-[#050507] border border-zinc-900 h-64 rounded-md overflow-hidden">
        {nodes.map(n=> (
          <div key={n.id} onMouseDown={onMouseDown(n.id)} style={{ left: n.x, top: n.y }} className="absolute w-40 p-2 bg-[#0b0b0d] border border-zinc-800 rounded shadow-sm cursor-grab">
            <div className="font-mono font-bold text-sm text-zinc-100">{n.id}</div>
            <div className="text-xs text-zinc-400 mt-1">Columns: {tables.find(t=>t.name===n.id)?.columns.map(c=>c.name).join(', ')}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 bg-[#070606] p-3 rounded-md border border-zinc-800">
        <h4 className="text-[11px] font-mono text-zinc-300 font-bold">Generated Prisma Schema</h4>
        <pre className="text-[11px] mt-2 p-2 bg-[#0b0b0d] rounded text-zinc-300 overflow-auto max-h-40">{prisma}</pre>
      </div>
    </div>
  );
};
