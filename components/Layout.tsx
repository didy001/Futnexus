
import React from 'react';
import { Activity, Wifi, ShieldCheck, AlertTriangle, Hexagon } from 'lucide-react';
import { NexusStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  status: NexusStatus;
}

const Layout: React.FC<LayoutProps> = ({ children, status }) => {
  const isOnline = status.status === 'ONLINE';

  return (
    <div className="h-screen w-full relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="hex-grid"></div>
      <div className="nebula-glow"></div>

      {/* --- FLOATING HUD HEADER --- */}
      <header className="fixed top-6 left-6 right-6 h-16 glass-panel rounded-lg flex items-center justify-between px-8 z-50 animate-appear">
        <div className="flex items-center gap-6">
          {/* LOGO AREA */}
          <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative flex items-center gap-3">
                <Hexagon className={`w-8 h-8 ${isOnline ? 'text-cyan-400 animate-spin-slow' : 'text-red-500'}`} strokeWidth={1.5} />
                <div className="flex flex-col">
                    <h1 className="text-2xl font-[Rajdhani] font-bold tracking-[0.25em] text-white sage-text leading-none">
                        NEXUS
                    </h1>
                    <span className="text-[10px] font-mono text-cyan-400 tracking-[0.4em] opacity-80">
                        SYSTEM AUTHORITY
                    </span>
                </div>
            </div>
          </div>
        </div>

        {/* TELEMETRY STRIP */}
        <div className="flex items-center gap-8 text-[10px] font-mono tracking-wider">
           <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase">Cognition Load</span>
              <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-bold">{status.metrics.memory_rss}</span>
                  <span className="text-cyan-500">MB</span>
              </div>
           </div>
           
           <div className="h-8 w-px bg-cyan-900/50"></div>

           <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase">Active Agents</span>
              <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-bold">{status.metrics.active_agents}</span>
                  <span className="text-purple-400">UNITS</span>
              </div>
           </div>

           <div className="h-8 w-px bg-cyan-900/50"></div>

           <div className="flex items-center gap-3 bg-[#000]/30 px-4 py-2 rounded-full border border-cyan-900/30">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-red-500 animate-pulse'}`}></div>
              <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                {isOnline ? 'LINK ESTABLISHED' : 'SEVERED'}
              </span>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT VIEWPORT --- */}
      <main className="absolute top-28 bottom-6 left-6 right-6 z-10 flex gap-6 overflow-hidden">
        {children}
      </main>

    </div>
  );
};

export default Layout;
