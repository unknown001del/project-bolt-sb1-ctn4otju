import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface MonacoDiffModalProps {
  open: boolean;
  filePath?: string;
  originalContent: string;
  newContent: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const detectLanguage = (filePath?: string) => {
  const ext = filePath?.split('.').pop()?.toLowerCase();
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
    case 'css':
      return 'css';
    case 'sql':
      return 'sql';
    default:
      return 'plaintext';
  }
};

export const MonacoDiffModal: React.FC<MonacoDiffModalProps> = ({
  open,
  filePath,
  originalContent,
  newContent,
  onConfirm,
  onCancel,
}) => {
  const [DiffEditor, setDiffEditor] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    import('@monaco-editor/react')
      .then((mod) => {
        if (!mounted) return;
        setDiffEditor(() => (mod as any).DiffEditor || mod);
      })
      .catch(() => setDiffEditor(null));
    return () => { mounted = false; };
  }, []);

  if (!open) return null;

  const language = detectLanguage(filePath);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-zinc-800 bg-[#09090d] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-zinc-200">Commit Diff Preview</h3>
            <p className="mt-1 text-[11px] text-zinc-400">{filePath || 'unspecified file'}</p>
          </div>
          <button
            type="button"
            aria-label="Close preview modal"
            onClick={onCancel}
            className="rounded-md border border-zinc-800 p-2 text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[380px] border-b border-zinc-800 bg-[#0d0d12]">
          {DiffEditor ? (
            <DiffEditor
              height="100%"
              language={language}
              original={originalContent}
              modified={newContent}
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                fontSize: 12,
                lineNumbersMinChars: 3,
              }}
            />
          ) : (
            <div className="h-full grid grid-cols-2">
              <textarea readOnly value={originalContent} className="w-full h-full p-3 bg-[#0b0b0d] text-xs text-zinc-300 font-mono border-r border-zinc-800" />
              <textarea readOnly value={newContent} className="w-full h-full p-3 bg-[#0b0b0d] text-xs text-zinc-300 font-mono" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Review proposed patch before committing to the repository.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-zinc-800 bg-[#0d0d12] px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-md bg-[#FF6B00] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#ff7a20]"
            >
              Confirm Commit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonacoDiffModal;
