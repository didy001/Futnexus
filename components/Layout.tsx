import React from 'react';
import { Activity, Hexagon, LayoutGrid, MessageSquare, Share2, GitBranch, Terminal } from 'lucide-react';
import { NexusStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  status: NexusStatus;
  currentView: string;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, status, currentView, onNavigate }) => {
  const isOnline = status.status === 'ONLINE';

  const navItems = [
      { id: 'DASHBOARD', icon: LayoutGrid, label: 'OVERVIEW' },
      { id: 'CHAT', icon: MessageSquare, label: 'OMNI-SHELL' },
      { id: 'HIERARCHY', icon: Share2, label: 'NEURAL MAP' },
      { id: 'PIPELINE', icon: GitBranch, label: 'FACTORY' },
      { id: 'CONSOLE', icon: Terminal, label: 'DIRECT LINK' },
  ];

  return (
    <div className="h-screen w-full relative selection:bg-cyan-500/30 selection:text-cyan-200 bg-[#030305] overflow-hidden font-sans">
      
      {/* --- BACKGROUND LAYERS (LOCKED) --- */}
      <div className="hex-grid z-0"></div>
      <div className="nebula-glow z-0"></div>

      {/* --- FLOATING HUD HEADER --- */}
      <header className="fixed top-6 left-24 right-6 h-16 glass-panel rounded-lg flex items-center justify-between px-8 z-40 animate-appear">
        <div className="flex items-center gap-6">
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

        {/* TELEMETRY */}
        <div className="flex items-center gap-8 text-[10px] font-mono tracking-wider">
           <div className="flex flex-col items-end hidden md:flex">
              <span className="text-slate-500 uppercase">Cognition Load</span>
              <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-bold">{status.metrics.memory_rss}</span>
                  <span className="text-cyan-500">MB</span>
              </div>
           </div>
           
           <div className="h-8 w-px bg-cyan-900/50 hidden md:block"></div>

           <div className="flex flex-col items-end hidden md:flex">
              <span className="text-slate-500 uppercase">Active Agents</span>
              <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-bold">{status.metrics.active_agents}</span>
                  <span className="text-purple-400">UNITS</span>
              </div>
           </div>

           <div className="h-8 w-px bg-cyan-900/50 hidden md:block"></div>

           <div className="flex items-center gap-3 bg-[#000]/30 px-4 py-2 rounded-full border border-cyan-900/30">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-red-500 animate-pulse'}`}></div>
              <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                {isOnline ? 'LINK ESTABLISHED' : 'SEVERED'}
              </span>
           </div>
        </div>
      </header>

      {/* --- NAVIGATION DOCK (LEFT) --- */}
      <nav className="fixed left-6 top-6 bottom-6 w-16 glass-panel rounded-lg flex flex-col items-center py-6 gap-8 z-50 animate-appear">
          <div className="flex-1 flex flex-col justify-center gap-6">
              {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                      <button 
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                            relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ease-out group
                            ${isActive ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}
                        `}
                      >
                          <Icon className="w-5 h-5" />
                          
                          {/* Tooltip */}
                          <div className="absolute left-14 bg-black/80 text-white text-[10px] font-mono py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {item.label}
                          </div>
                          
                          {/* Active Indicator */}
                          {isActive && <div className="absolute -left-3 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#00f3ff]"></div>}
                      </button>
                  )
              })}
          </div>
          
          <div className="text-[8px] font-mono text-slate-600 rotate-180 writing-vertical tracking-widest opacity-50">
              V.11.0.0-CIEL
          </div>
      </nav>

      {/* --- MAIN CONTENT VIEWPORT --- */}
      <main className="absolute top-28 bottom-6 left-24 right-6 z-10 overflow-hidden rounded-lg border border-white/5 bg-[#050a14]/50 backdrop-blur-sm shadow-inner transition-all duration-500">
        {children}
      </main>

    </div>
  );
};

export default Layout;