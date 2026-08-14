import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FileSystemProvider } from './context/FileSystemContext';
import { AuthOverlay } from './components/AuthOverlay';
import { Sidebar } from './components/Sidebar';
import { BertinPlanner } from './components/BertinPlanner';
import { AIProductionHub } from './components/AIProductionHub';
import { DatabaseCanvas } from './components/DatabaseCanvas';
import { TerminalDock } from './components/TerminalDock';
import { FileSystemMirror } from './components/FileSystemMirror';
import { MultiplayerPresence } from './components/MultiplayerPresence';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import GithubBrowserWrapper from './components/GithubBrowserWrapper';
import CodeEditorConnected from './components/CodeEditorConnected';
import { EditorProvider } from './context/EditorContext';
import ProjectCards from './components/ProjectCards';
import Welcome from './components/Welcome';

import { NovaLogo } from '../components/nova/nova-logo';
import PreviewWrapper from './components/PreviewWrapper';
import CmdPalette from './components/CmdPalette';
import WebContainerRunner from './components/WebContainerRunner';
import WorkspaceTabs from './components/WorkspaceTabs';

const Header: React.FC<{ onDeploy: ()=>void }> = ({ onDeploy }) => {
  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0d0d12] border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <NovaLogo size={28} />
        <div className="text-sm font-black font-mono tracking-widest uppercase">
          NOVA <span className="text-[#FF6B00]">APP BUILDER</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onDeploy} className="bg-[#FF6B00] text-black px-3 py-2 rounded-md flex items-center gap-2"><Rocket className="w-4 h-4"/> Deploy App</button>
      </div>
    </header>
  );
};

const IdeWorkspace: React.FC<{ onSignOut: ()=>void }> = ({ onSignOut }) => {
  const [active, setActive] = useState('explorer');

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase text-zinc-400">Nova App Builder</h2>
            <p className="mt-1 text-[11px] text-zinc-500">Design, generate, ship, and deploy world-class app experiences from one premium control surface.</p>
          </div>
          <div className="flex items-center gap-3">
            <FileSystemMirrorButton />
            <button onClick={onSignOut} className="px-3 py-2 border border-zinc-800 rounded-md text-sm">Sign Out</button>
          </div>
        </div>
        <div className="mt-3">
          {/* Project onboarding cards */}
          <div className="bg-[#070708] p-3 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-mono text-zinc-300 font-bold mb-2">Get started</h4>
            <ProjectCards />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
             <AIProductionHub />
             <div className="mt-4">
               <DatabaseCanvas />
             </div>
             <div className="mt-4">
               {/* GitHub browser shown in left column under AI/DB */}
               <div className="bg-[#070708] p-3 rounded-xl border border-zinc-800">
                 <h4 className="text-xs font-mono text-zinc-300 font-bold mb-2">Repository</h4>
                 {/* GithubBrowser will show sign-in prompt if not connected */}
                 <React.Suspense fallback={<div className="text-xs text-zinc-500">Loading GitHub...</div>}>
                   <GithubBrowserWrapper />
                 </React.Suspense>
               </div>
             </div>
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            <FileSystemMirror />
            <div className="bg-[#070708] p-3 rounded-xl border border-zinc-800">
              <MultiplayerPresence />
            </div>
            <div className="mt-3 bg-[#070708] p-3 rounded-xl border border-zinc-800">
              {/* Tab switcher between Code Editor and Visual Canvas */}
              <WorkspaceTabs />
            </div>
            <div className="mt-3">
              <CodeEditorConnected />
            </div>
            <div className="mt-4">
              {/* WebContainer runner tries to boot an in-browser dev server; falls back to preview wrapper when not available */}
              <WebContainerRunner files={{}} startCommand={'npm run dev'} />
              <div className="mt-4">
                <PreviewWrapper url="http://localhost:5173" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <TerminalDock />
        </div>
      </div>
    </div>
  );
};

const FileSystemMirrorButton: React.FC = ()=> {
  return (
    <div>
      {/* Placeholder to visually mirror the FileSystem action in header */}
    </div>
  );
};

const InnerApp: React.FC = () => {
  const { auth, signOut } = useAuth();
  // page can be 'welcome' | 'templates' | 'showcase' | 'app'
  const [page, setPage] = useState<'welcome'|'templates'|'showcase'|'app'>(() => auth.signedIn ? 'app' : 'welcome');
  const [stage, setStage] = useState<'planning'|'ide'>('planning');

  useEffect(()=>{
    // ensure route consistency for older links
    if (!auth.signedIn && page !== 'welcome') setPage('welcome');
  },[auth.signedIn]);

  const onApprove = () => setStage('ide');
  
  // If guest continues from welcome
  const handleGuestContinue = () => setPage('app');

  const [cmdOpen, setCmdOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleAction = (id: string) => {
    setCmdOpen(false);
    if (id === 'templates') setPage('templates');
    if (id === 'deploy') alert('Simulated deploy flow');
    if (id === 'new') alert('Create new project (simulated)');
    if (id === 'export') alert('Exporting project (simulated)');
    if (id === 'open-workspace') setPage('app');
  };

  if (page === 'welcome') {
    return <>
      <Welcome onGuest={handleGuestContinue} />
      <CmdPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onAction={handleAction} />
    </>;
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      <Header onDeploy={()=>alert('Simulated deploy flow (Parsing → Provisioning → Linking → Success)')} />
      {stage==='planning' && page === 'app' ? (
        <div className="flex-1">
          <BertinPlanner onApprove={onApprove} />
        </div>
      ) : (
        <IdeWorkspace onSignOut={signOut} />
      )}
      {!auth.signedIn && <AuthOverlay />}
      <CmdPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onAction={handleAction} />
    </div>
  );
};

export default function App() {
  return (
    <FileSystemProvider>
      <AuthProvider>
        <EditorProvider>
          <InnerApp />
        </EditorProvider>
      </AuthProvider>
    </FileSystemProvider>
  );
}
