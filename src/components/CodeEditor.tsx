import React, { useEffect, useState } from 'react';
import MonacoLoader from './MonacoLoader';
import { useFileSystem } from '../context/FileSystemContext';

export interface FileDocument {
  path: string;
  content: string;
  language?: string;
}

export interface CodeEditorProps {
  initialPath?: string;
  initialContent?: string;
  docs?: FileDocument[];
  onSelectDocument?: (doc: FileDocument) => void;
}

const DEFAULT_DOCUMENTS: FileDocument[] = [
  { path: 'src/App.tsx', content: "import React from 'react';\n\nexport default function App() {\n  return <div className='text-white'>Nova App Builder</div>;\n}\n", language: 'typescript' },
  { path: 'src/components/BertinPlanner.tsx', content: "export const BertinPlanner = () => {\n  return <div>Bertin planner ready</div>;\n};\n", language: 'typescript' },
  { path: 'src/database/schema.ts', content: "export const schema = `\nmodel User {\n  id String @id @default(uuid())\n}\n`;\n", language: 'typescript' },
  { path: 'src/server/api/hello.ts', content: "export default async function handler() {\n  return Response.json({ ok: true });\n}\n", language: 'typescript' },
  { path: 'package.json', content: '{\n  "name": "nova-app-builder"\n}\n', language: 'json' }
];

export const CodeEditor: React.FC<CodeEditorProps> = ({ initialPath = 'src/App.tsx', initialContent = '', docs = DEFAULT_DOCUMENTS, onSelectDocument }) => {
  const [documents, setDocuments] = useState<FileDocument[]>(docs.length ? docs : DEFAULT_DOCUMENTS);
  const [path, setPath] = useState(initialPath);
  const [content, setContent] = useState(initialContent || docs.find((d) => d.path === initialPath)?.content || DEFAULT_DOCUMENTS[0].content);
  const [status, setStatus] = useState<string | null>(null);
  const { writeFile, bound, bind } = useFileSystem() as any;

  useEffect(() => {
    if (!initialPath) return;
    const d = documents.find((doc) => doc.path === initialPath);
    if (d) {
      setPath(d.path);
      setContent(d.content);
    }
  }, [initialPath, documents]);

  const openDocument = (doc: FileDocument) => {
    setPath(doc.path);
    setContent(doc.content);
    setStatus(`Loaded ${doc.path}`);
    onSelectDocument?.(doc);
  };

  const save = async () => {
    if (!path) return alert('Please provide a path');
    try {
      setDocuments((prev) => {
        const next = prev.map((doc) => (doc.path === path ? { ...doc, content } : doc));
        if (!next.some((doc) => doc.path === path)) next.push({ path, content, language: 'typescript' });
        return next;
      });

      await writeFile(path, content);
      setStatus('Saved to bound mirror successfully');
    } catch (e: any) {
      setStatus('Error: ' + (e.message || e));
    }
  };

  return (
    <div className="bg-[#070708] p-3 rounded-xl border border-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-mono font-bold text-zinc-300">Project Explorer</div>
        <button onClick={async () => { if (!bound) { try { await bind(); } catch (e) { alert('Bind failed: ' + e); } } }} className="px-2 py-1 bg-[#0d0d12] border border-zinc-800 rounded text-[10px]">Bind Mirror</button>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 max-h-32 overflow-auto">
        {documents.map((doc) => (
          <button key={doc.path} onClick={() => openDocument(doc)} className={`text-left px-2 py-1 rounded border ${path === doc.path ? 'border-[#FF6B00] bg-[#111116]' : 'border-zinc-800 bg-[#0d0d12]'} text-[11px] text-zinc-300`}>
            {doc.path}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <input className="w-full bg-[#0d0d12] p-2 rounded-md border border-zinc-800 text-xs" value={path} onChange={(e)=>setPath(e.target.value)} />
        <button onClick={save} className="ml-2 px-3 py-2 bg-[#FF6B00] rounded text-black text-xs font-bold">Save</button>
      </div>

      <div className="h-80 border border-zinc-900 rounded overflow-hidden">
        <MonacoLoader
          value={content}
          language={documents.find((doc) => doc.path === path)?.language || 'typescript'}
          onChange={(v) => setContent(v || '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>
      {status && <div className="text-[12px] text-zinc-400 mt-2">{status}</div>}
    </div>
  );
};

export default CodeEditor;
