import React from 'react';
import { useEditor } from '../context/EditorContext';

const SAMPLE_PROJECTS = [
  {
    id: 'starter-webapp',
    title: 'Starter Web App',
    desc: 'Minimal React + Tailwind scaffold with home, about, and api endpoints.',
    files: [
      { path: 'src/pages/index.tsx', content: "export default function Home(){ return <div>Welcome to Nova Starter Web App</div> }", language: 'typescript' },
      { path: 'src/components/Header.tsx', content: "export const Header=() => <header>Nova</header>", language: 'typescript' }
    ]
  },
  {
    id: 'anime-studio',
    title: 'AI Anime Studio',
    desc: 'Includes AI Production Hub, basic DB models and sample components.',
    files: [
      { path: 'src/pages/studio.tsx', content: "export default function Studio(){ return <div>Anime Studio</div> }", language: 'typescript' },
      { path: 'src/components/Player.tsx', content: "export const Player=() => <div>Player</div>", language: 'typescript' }
    ]
  }
];

export const ProjectCards: React.FC = () => {
  const { setDocuments, openDocument } = useEditor();

  const launchProject = (proj: any) => {
    // set documents in editor context and open first file
    setDocuments(proj.files);
    openDocument(proj.files[0]);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {SAMPLE_PROJECTS.map(p => (
        <div key={p.id} className="p-3 bg-[#0b0b0d] border border-zinc-800 rounded-lg">
          <h4 className="text-xs font-mono font-bold text-zinc-200">{p.title}</h4>
          <p className="text-[11px] text-zinc-400 mt-1">{p.desc}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>launchProject(p)} className="px-3 py-2 bg-[#FF6B00] text-black rounded text-xs font-bold">Open</button>
            <button className="px-3 py-2 border border-zinc-800 rounded text-xs">Preview</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectCards;
