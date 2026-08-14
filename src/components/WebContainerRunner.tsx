import React, { useEffect, useRef, useState } from 'react';

export const WebContainerRunner: React.FC<{ files?: Record<string,string>; startCommand?: string }> = ({ files = {}, startCommand = 'npm run dev' }) => {
  const [status, setStatus] = useState<'idle'|'booting'|'installing'|'running'|'failed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const procRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setStatus('booting');
      try {
        const mod = await import('@webcontainer/api');
        const { WebContainer } = mod as any;
        const wc = await WebContainer.boot();
        setLogs(l => [...l, 'WebContainer booted']);

        if (Object.keys(files).length) {
          await wc.mount(files);
          setLogs(l => [...l, 'Files mounted into webcontainer']);
        }

        setStatus('installing');
        // spawn npm install
        try {
          const install = await wc.spawn('bash', ['-lc', 'npm install --silent']);
          // read output
          install.output.pipeTo(new WritableStream({
            write(chunk) {
              // chunk may be Uint8Array
              const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as any);
              setLogs(l => [...l, text]);
            }
          }));
        } catch (ie) {
          setLogs(l => [...l, 'npm install failed or was skipped: ' + String(ie)]);
        }

        setStatus('running');
        try {
          procRef.current = await wc.spawn('bash', ['-lc', startCommand]);
          setLogs(l => [...l, `Spawned: ${startCommand}`]);
          const p = procRef.current;
          // stream stdout
          if (p && p.output) {
            p.output.pipeTo(new WritableStream({
              write(chunk) {
                const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as any);
                setLogs(l => [...l, text]);
              }
            }));
          }
        } catch (re) {
          setLogs(l => [...l, 'Run failed: ' + String(re)]);
        }

      } catch (err) {
        console.warn('WebContainer boot failed', err);
        if (mounted) {
          setStatus('failed');
          setLogs(l => [...l, 'WebContainer not available: ' + String(err)]);
        }
      }
    };

    run();
    return () => { mounted = false; if (procRef.current && procRef.current.kill) procRef.current.kill(); };
  }, []);

  return (
    <div className="bg-[#070708] p-3 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono text-zinc-300">WebContainer Runner</div>
        <div className="text-xs text-zinc-400">{status}</div>
      </div>
      <div className="h-48 overflow-auto monospace text-xs bg-black p-2 rounded">
        {logs.length === 0 && <div className="text-zinc-500">No logs yet</div>}
        {logs.map((l, i) => <div key={i} className="whitespace-pre-wrap text-zinc-200">{l}</div>)}
      </div>
    </div>
  );
};

export default WebContainerRunner;
