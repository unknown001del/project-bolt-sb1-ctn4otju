import React, { useEffect, useRef, useState } from 'react';

export const WebContainerRunner: React.FC<{ files?: Record<string,string>; startCommand?: string; onUrl?: (url: string|null) => void }> = ({ files = {}, startCommand = 'npm run dev', onUrl }) => {
  const [status, setStatus] = useState<'idle'|'booting'|'mounted'|'installing'|'running'|'failed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [port, setPort] = useState<number>(5173);
  const [started, setStarted] = useState<boolean>(false);
  const procRef = useRef<any>(null);
  const wcRef = useRef<any>(null);

  const appendLog = (text: string) => setLogs(l => [...l, typeof text === 'string' ? text : String(text)]);

  useEffect(() => {
    // Auto-reload: when previewUrl changes and onUrl provided, notify parent.
    onUrl?.(previewUrl ?? null);
  }, [previewUrl, onUrl]);

  useEffect(() => {
    let mounted = true;
    if (!started) return;

    const run = async () => {
      setStatus('booting');
      try {
        const mod = await import('@webcontainer/api');
        const { WebContainer } = mod as any;
        const wc = await WebContainer.boot();
        wcRef.current = wc;
        appendLog('WebContainer booted');

        if (Object.keys(files).length) {
          setStatus('mounted');
          await wc.mount(files);
          appendLog('Files mounted into webcontainer');
        }

        setStatus('installing');
        try {
          const install = await wc.spawn('bash', ['-lc', 'npm install --silent']);
          appendLog('Running: npm install --silent');

          // stream output
          if (install.output) {
            install.output.pipeTo(new WritableStream({
              write(chunk) {
                const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as any);
                appendLog(text);
              }
            }));
          }
          await install.exit;
          appendLog('npm install finished');
        } catch (ie) {
          appendLog('npm install failed or skipped: ' + String(ie));
        }

        setStatus('running');
        try {
          procRef.current = await wc.spawn('bash', ['-lc', startCommand]);
          appendLog(`Spawned: ${startCommand}`);
          const p = procRef.current;
          if (p && p.output) {
            p.output.pipeTo(new WritableStream({
              write(chunk) {
                const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as any);
                appendLog(text);
              }
            }));
          }

          // Try to open the selected port
          try {
            appendLog(`Attempting to open port ${port}...`);
            const portOpen = await wc.openPort(port);
            const url = portOpen?.url ?? null;
            setPreviewUrl(url);
            appendLog(`Preview available at: ${url}`);
          } catch (openErr) {
            appendLog('openPort failed: ' + String(openErr));
          }

        } catch (re) {
          appendLog('Run failed: ' + String(re));
        }

      } catch (err) {
        console.warn('WebContainer boot failed', err);
        if (mounted) {
          setStatus('failed');
          appendLog('WebContainer not available: ' + String(err));
          setPreviewUrl(null);
        }
      }
    };

    run();

    return () => { mounted = false; if (procRef.current && procRef.current.kill) procRef.current.kill(); };
  }, [files, startCommand, started, port]);

  const stop = async () => {
    try {
      if (procRef.current && procRef.current.kill) {
        procRef.current.kill();
      }
      if (wcRef.current && wcRef.current.teardown) {
        await wcRef.current.teardown();
      }
    } catch (e) {
      appendLog('Stop error: ' + String(e));
    } finally {
      setStarted(false);
      setStatus('idle');
      setPreviewUrl(null);
      onUrl?.(null);
    }
  };

  const retryOpenPort = async () => {
    try {
      if (!wcRef.current) {
        appendLog('No webcontainer instance available to open port.');
        return;
      }
      appendLog(`Retrying openPort(${port})...`);
      const portOpen = await wcRef.current.openPort(port);
      const url = portOpen?.url ?? null;
      setPreviewUrl(url);
      appendLog(`Preview available at: ${url}`);
    } catch (err) {
      appendLog('Retry openPort failed: ' + String(err));
    }
  };

  const statusStepIndex = (s: typeof status) => {
    switch (s) {
      case 'idle': return 0;
      case 'booting': return 1;
      case 'mounted': return 2;
      case 'installing': return 3;
      case 'running': return 4;
      case 'failed': return 5;
      default: return 0;
    }
  };

  const steps = ['Idle','Booting','Mounted','Installing','Running','Failed'];
  const stepIndex = statusStepIndex(status);

  return (
    <div className="bg-[#070708] p-3 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono text-zinc-300">WebContainer Runner</div>
        <div className="text-xs text-zinc-400">{status}</div>
      </div>

      <div className="mb-3">
        <div className="text-[11px] text-zinc-400 mb-2">Port</div>
        <div className="flex gap-2 items-center">
          <input value={port} onChange={(e) => setPort(Number(e.target.value) || 5173)} className="w-28 bg-[#0d0d12] border border-zinc-800 rounded px-2 py-1 text-xs" />
          <button onClick={() => setStarted(true)} disabled={started} className={`px-3 py-1 text-xs rounded font-bold ${started ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500 text-black'}`}>Start</button>
          <button onClick={stop} disabled={!started} className={`px-3 py-1 text-xs rounded ${!started ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600 text-black'}`}>Stop</button>
          <button onClick={retryOpenPort} className="px-2 py-1 text-xs rounded border border-zinc-800">Retry Open Port</button>
          <button onClick={() => { setLogs([]); setPreviewUrl(null); onUrl?.(null); }} className="ml-auto px-2 py-1 border border-zinc-800 rounded text-xs">Clear</button>
        </div>

        <div className="h-2 bg-zinc-800 rounded mt-3 overflow-hidden">
          <div style={{ width: `${Math.max(5, (stepIndex / (steps.length-1))*100)}%` }} className="h-2 bg-amber-500 transition-all"></div>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">{steps[stepIndex]}</div>
      </div>

      <div className="h-40 overflow-auto monospace text-xs bg-black p-2 rounded mb-3">
        {logs.length === 0 && <div className="text-zinc-500">No logs yet</div>}
        {logs.map((l, i) => <div key={i} className="whitespace-pre-wrap text-zinc-200">{l}</div>)}
      </div>

      <div className="flex items-center gap-2">
        {previewUrl ? (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-[#FF6B00] text-black rounded font-bold">Open In-Container Preview</a>
        ) : (
          <div className="text-xs text-zinc-400">In-container preview not available yet</div>
        )}
      </div>
    </div>
  );
};

export default WebContainerRunner;
