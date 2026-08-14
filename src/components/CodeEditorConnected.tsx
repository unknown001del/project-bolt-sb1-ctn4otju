import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useFileSystem } from '../context/FileSystemContext';
import { useEditor, FileDocument } from '../context/EditorContext';

const detectLanguage = (path?: string) => {
  const ext = path?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

export const CodeEditorConnected: React.FC<{ initialPath?: string }> = ({ initialPath = '' }) => {
  const { documents, activePath, openDocument, updateDocument, setDocuments } = useEditor();
  const [path, setPath] = useState<string>(initialPath || activePath || documents[0]?.path || 'src/App.tsx');
  const [content, setContent] = useState<string>(documents.find(d => d.path === path)?.content || '');
  const [status, setStatus] = useState<string | null>(null);
  const { writeFile, bound, bind } = useFileSystem() as any;
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const cursorIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePath) return;
    const d = documents.find(doc => doc.path === activePath);
    if (d) {
      setPath(d.path);
      setContent(d.content);
    }
  }, [activePath, documents]);

  useEffect(() => {
    if (documents.length === 0) setDocuments([{ path: 'src/App.tsx', content: 'export default function App() { return null }' }]);
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Simulated multiplayer cursors using decorations
    let positions = [{ lineNumber: 2, column: 2 }, { lineNumber: 4, column: 6 }];
    const colors = ['#22d3ee', '#ff6b00'];

    const updateCursors = () => {
      if (!editorRef.current || !monacoRef.current) return;
      const model = editorRef.current.getModel();
      if (!model) return;

      positions = positions.map((p, idx) => {
        const line = Math.max(1, Math.min(model.getLineCount(), p.lineNumber + (Math.random() > 0.5 ? 1 : -1)));
        const col = Math.max(1, Math.min(model.getLineMaxColumn(line), p.column + (Math.random() > 0.5 ? 2 : -2)));
        return { lineNumber: line, column: col };
      });

      const newDecorations = positions.map((pos, i) => ({
        range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
        options: {
          className: '',
          isWholeLine: false,
          afterContentClassName: `nova-cursor-${i}`,
        }
      }));

      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);

      const styleId = 'nova-cursor-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          .monaco-editor .nova-cursor-0::after { content: '' ; display:inline-block; width:2px; height:1.2em; background: ${colors[0]}; margin-left:2px; box-shadow: 0 0 8px ${colors[0]}; }
          .monaco-editor .nova-cursor-1::after { content: '' ; display:inline-block; width:2px; height:1.2em; background: ${colors[1]}; margin-left:2px; box-shadow: 0 0 8px ${colors[1]}; }
          .monaco-editor .nova-cursor-0:before { content: 'Alex'; color:#000; background:${colors[0]}; padding:2px 6px; border-radius:6px; margin-right:6px; font-size:10px; font-family:monospace; position:relative; top:-6px }
          .monaco-editor .nova-cursor-1:before { content: 'Sarah'; color:#000; background:${colors[1]}; padding:2px 6px; border-radius:6px; margin-right:6px; font-size:10px; font-family:monospace; position:relative; top:-6px }
        `;
        document.head.appendChild(style);
      }
    };

    cursorIntervalRef.current = window.setInterval(updateCursors, 1200);
  };

  const save = async () => {
    if (!path) return alert('Please provide a path');
    try {
      updateDocument(path, content);
      await writeFile(path, content);
      setStatus('Saved to bound mirror successfully');
    } catch (e: any) {
      setStatus('Error: ' + (e.message || e));
    }
  };

  useEffect(() => {
    return () => {
      if (cursorIntervalRef.current) window.clearInterval(cursorIntervalRef.current);
    };
  }, []);

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
        <Editor
          height="100%"
          defaultLanguage={detectLanguage(path)}
          value={content}
          onChange={(v) => setContent(v || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>
      {status && <div className="text-[12px] text-zinc-400 mt-2">{status}</div>}
    </div>
  );
};

export default CodeEditorConnected;
