import React from 'react';
import { NovaLogo } from './nova/nova-logo';
import { Sparkles } from 'lucide-react';

export const Welcome: React.FC<{ onGuest?: ()=>void }> = ({ onGuest }) => {
  const goToApp = () => {
    if (onGuest) return onGuest();
    // Navigate to app root
    window.history.pushState({}, '', '/');
    // trigger a popstate so app can react if needed
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050507] to-[#07070a] text-zinc-100 flex flex-col">      <header className="h-20 flex items-center justify-between px-8 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <NovaLogo size={36} />
          <div className="font-mono font-bold tracking-wide text-xl">NOVA App Builder</div>
        </div>
        <nav className="flex items-center gap-4">
          <a className="text-sm text-zinc-300 hover:text-white">Pricing</a>
          <a className="text-sm text-zinc-300 hover:text-white">Showcase</a>
          <a className="text-sm text-zinc-300 hover:text-white">Docs</a>
          <button onClick={goToApp} className="ml-4 bg-[#FF6B00] px-4 py-2 rounded-md text-black font-bold">Sign In</button>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <section className="space-y-6">
            <motion.h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              Build Apps <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">10x Faster</span> with <span className="text-[#FF6B00]">Nova</span>
            </motion.h1>
            <p className="text-zinc-400 text-xl">World-class AI-powered app builder — design, generate, and deploy production apps without server costs. Zero-config, local-first, and built for teams.</p>

            <div className="flex items-center gap-3">
              <motion.button onClick={goToApp} whileHover={{ y: -4 }} className="bg-[#FF6B00] px-6 py-4 rounded-xl font-bold text-black inline-flex items-center gap-2">
                <span>Start Building Free</span>
                <motion.span initial={{ x: 0 }} whileHover={{ x: 6 }} transition={{ duration: 0.25 }}>→</motion.span>
              </motion.button>
              <motion.button className="px-5 py-3 border border-zinc-800 rounded-xl text-sm flex items-center gap-2" whileHover={{ scale: 1.02 }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M5 3v18l15-9L5 3z" fill="#FF6B00"/></svg>
                Watch 30s Demo
              </motion.button>
            </div>

            <div className="mt-6 bg-[#0b0b0d] p-3 rounded-xl border border-zinc-800">
              <div className="text-[13px] font-mono text-zinc-300">Trusted by 10,000+ builders</div>
              <div className="mt-3 flex items-center gap-4">
                <img src="https://picsum.photos/80/24?random=1" alt="logo1" className="h-6" />
                <img src="https://picsum.photos/80/24?random=2" alt="logo2" className="h-6" />
                <img src="https://picsum.photos/80/24?random=3" alt="logo3" className="h-6" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-3 bg-[#0b0b0d] rounded-xl border border-zinc-800">AI App Generation in 10s</div>
              <div className="p-3 bg-[#0b0b0d] rounded-xl border border-zinc-800">Free AI Models (No API Key)</div>
              <div className="p-3 bg-[#0b0b0d] rounded-xl border border-zinc-800">One-Click Deploy to Vercel</div>
              <div className="p-3 bg-[#0b0b0d] rounded-xl border border-zinc-800">Real-time Preview & Edit</div>
              <div className="p-3 bg-[#0b0b0d] rounded-xl border border-zinc-800">50+ Templates</div>
              <div className="p-3 bg-[#0b0b0d] rounded-xl border border-zinc-800">Export Clean React Code</div>
            </div>
          </section>

          <aside className="relative">
            <div>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 mb-4">
                {/* Typewriter demo shows code typing animation */}
                <TypewriterDemo />
              </div>

              <div className="mt-2 bg-[#0b0b0d] p-3 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-200">Testimonials</h4>
                <div className="mt-2 text-[12px] text-zinc-400">"Nova cut our development time in half." — Alex K.</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="h-20 border-t border-zinc-800 flex items-center justify-between px-8">
        <div className="text-sm text-zinc-400">© {new Date().getFullYear()} Nova Studio</div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <a>Terms</a>
          <a>Privacy</a>
          <a>Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
