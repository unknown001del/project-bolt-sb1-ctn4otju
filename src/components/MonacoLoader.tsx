import React, { useEffect, useState } from 'react';

interface MonacoLoaderProps {
  value: string;
  language?: string;
  theme?: string;
  options?: any;
  onChange?: (v: string | undefined) => void;
  onMount?: (editor?: any, monaco?: any) => void;
}

export const MonacoLoader: React.FC<MonacoLoaderProps> = ({ value, language = 'javascript', theme = 'vs-dark', options = {}, onChange, onMount }) => {
  const [Editor, setEditor]: any = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('@monaco-editor/react')
      .then((mod) => {
        if (!mounted) return;
        setEditor(() => mod.default || mod.Editor || mod);
      })
      .catch((err) => {
        console.warn('Monaco failed to load dynamically, falling back to textarea', err);
        setLoadError(true);
      });
    return () => { mounted = false; };
  }, []);

  if (Editor && !loadError) {
    const C = Editor as any;
    return (
      <C
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        onMount={onMount}
        theme={theme}
        options={options}
      />
    );
  }

  // Fallback textarea
  return (
    <textarea
      className="w-full h-full bg-[#0b0b0d] text-sm p-2 font-mono text-zinc-100"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
};

export default MonacoLoader;
