/**
 * Navigation - Premium Navigation System
 * Provides access to all AI generators with a sleek sidebar
 */

import { User, Image as ImageIcon, Video, BookOpen, Film, Sparkles } from 'lucide-react';

export type NavigationTab = 'characters' | 'image' | 'video' | 'stories' | 'anime';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: any;
  description: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: 'characters',
    label: 'Characters',
    icon: User,
    description: 'Create consistent characters',
    color: 'violet',
  },
  {
    id: 'image',
    label: 'Image Generator',
    icon: ImageIcon,
    description: 'World-class AI images',
    color: 'cyan',
  },
  {
    id: 'video',
    label: 'Video Generator',
    icon: Video,
    description: 'Cinematic AI videos',
    color: 'emerald',
  },
  {
    id: 'stories',
    label: 'Story Library',
    icon: BookOpen,
    description: 'AI-powered stories',
    color: 'amber',
  },
  {
    id: 'anime',
    label: 'Anime Movie',
    icon: Film,
    description: 'Studio Ghibli quality',
    color: 'pink',
  },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex w-64 flex-col gap-2 border-r border-white/[0.06] bg-obsidian/40 p-3 backdrop-blur">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2 px-2">
        <Sparkles className="text-violet-400" size={20} />
        <div>
          <h1 className="font-display text-sm font-bold leading-none tracking-wider text-white">
            ALPHA <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">STUDIO</span>
          </h1>
          <p className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">AI Generation Suite</p>
        </div>
      </div>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const colorClasses = {
          violet: isActive ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' : 'border-transparent text-zinc-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-300',
          cyan: isActive ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-transparent text-zinc-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-300',
          emerald: isActive ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-transparent text-zinc-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-300',
          amber: isActive ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-transparent text-zinc-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-300',
          pink: isActive ? 'border-pink-500/50 bg-pink-500/10 text-pink-300' : 'border-transparent text-zinc-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-300',
        };

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${colorClasses[item.color as keyof typeof colorClasses]}`}
          >
            <Icon size={18} />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[10px] opacity-70">{item.description}</p>
            </div>
          </button>
        );
      })}

      {/* Footer */}
      <div className="mt-auto rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
        <p className="text-[9px] text-zinc-600">
          World's Best AI Generators
        </p>
      </div>
    </nav>
  );
}
