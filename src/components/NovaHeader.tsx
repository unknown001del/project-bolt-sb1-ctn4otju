import React from 'react';
import { motion } from 'framer-motion';

export const NovaHeader: React.FC = ()=> (
  <motion.header initial={{ y:-10, opacity: 0 }} animate={{ y:0, opacity: 1 }} transition={{ duration: 0.35 }} className="sticky top-0 z-50 h-16 backdrop-blur-xl bg-zinc-950/70 border-b border-white/[0.06] flex items-center justify-between px-6">
    <div className="flex items-center gap-4">
      <motion.div animate={{ rotate: [0,6,-6,0] }} transition={{ repeat: Infinity, duration: 6 }} className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0ff] to-[#FF6B00] flex items-center justify-center shadow-lg">
        <span className="font-black text-black text-sm tracking-tighter">N</span>
      </motion.div>
      <div className="text-sm font-black font-mono tracking-widest uppercase">NOVA <span className="text-[#FF6B00]">APP BUILDER</span></div>
    </div>

    <div className="flex items-center gap-3">
      <a href="https://github.com/unknown001del/project-bolt-sb1-ctn4otju" target="_blank" rel="noreferrer" className="text-xs font-mono bg-[#0d0d12] border border-zinc-800 px-3 py-1 rounded-full hover:bg-[#111116] transition flex items-center gap-2">
        <span className="text-sm">⭐</span>
        <span className="text-zinc-200">Star on GitHub</span>
      </a>
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => window.alert('Simulated deploy') } className="bg-gradient-to-r from-[#FF6B00] to-[#ff7a20] px-3 py-2 rounded-md text-black font-bold relative overflow-hidden">
        <span className="relative z-10">🚀 Deploy</span>
        <motion.span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/0 opacity-0" whileHover={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      </motion.button>
    </div>
  </motion.header>
);

export default NovaHeader;
