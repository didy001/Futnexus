
import React from 'react';
import { Activity, Hexagon, LayoutGrid, MessageSquare, Share2, GitBranch, Terminal, Eye } from 'lucide-react';
import { NexusStatus, UIState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  status: NexusStatus;
  currentView: string;
  onNavigate: (view: any) => void;
  uiState: UIState;
}

const Layout: React.FC<LayoutProps> = ({ children, status, currentView, onNavigate, uiState }) => {
  const isOnline = status.status === 'ONLINE';
  const { domainExpansion, themeMode } = uiState;

  const navItems = [
      { id: 'DASHBOARD', icon: LayoutGrid, label: 'GOD VIEW' },
      { id: 'CHAT', icon: MessageSquare, label: 'OMNI-SHELL' },
      { id: 'HIERARCHY', icon: Share2, label: 'NEURAL MAP' },
      { id: 'PIPELINE', icon: GitBranch, label: 'VALUE FACTORY' },
      { id: 'CONSOLE', icon: Terminal, label: 'DIRECT LINK' },
  ];

  // Dynamic Theme Colors (Explicit Mapping for JIT)
  const getThemeClasses = () => {
      switch (themeMode) {
          case 'WAR':
              return {
                  text: 'text-red-400',
                  text500: 'text-red-500',
                  bg500: 'bg-red-500',
                  bg900: 'bg-red-900',
                  border: 'border-red-500',
                  shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
                  bgGradient: 'radial-gradient(circle at 50% 50%, #200000 0%, #000000 100%)'
              };
          case 'GOLD':
              return {
                  text: 'text-yellow-400',
                  text500: 'text-yellow-500',
                  bg500: 'bg-yellow-500',
                  bg900: 'bg-yellow-900',
                  border: 'border-yellow-500',
                  shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
                  bgGradient: 'radial-gradient(circle at 50% 50%, #201000 0%, #000000 100%)'
              };
          default: // DEFAULT / VOID
              return {
                  text: 'text-cyan-400',
                  text500: 'text-cyan-500',
                  bg500: 'bg-cyan-500',
                  bg900: 'bg-cyan-900',
                  border: 'border-cyan-500',
                  shadow: 'shadow-[0_0_15px_rgba(0,243,255,0.3)]',
                  bgGradient: 'radial-gradient(circle at 50% 50%, #0d1220 0%, #000000 100%)'
              };
      }
  };

  const theme = getThemeClasses();
  const visibilityClass = domainExpansion ? 'opacity-0 pointer-events-none' : 'opacity-100';

  return (
    <div 
        className="h-screen w-full relative selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden font-sans transition-all duration-1000"
        style={{ backgroundImage: theme.bgGradient, backgroundColor: '#000' }}
    >
      
      {/* --- BACKGROUND LAYERS (LOCKED) --- */}
      <div className={`hex-grid z-0 transition-opacity duration-1000 ${domainExpansion ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className="nebula-glow z-0"></div>

      {/* --- DOMAIN EXPANSION INDICATOR (Zen Mode) --- */}
      {domainExpansion && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-1000">
              <div className={`flex items-center gap-2 px-4 py-1 rounded-full border ${theme.border}/30 bg-black/50 backdrop-blur-md ${theme.text500} font-mono text-[10px] tracking-[0.5em]`}>
                  <Eye className="w-3 h-3 animate-pulse" /> DOMAIN EXPANSION: SANCTUARY
              </div>
          </div>
      )}

      {/* --- FLOATING HUD HEADER --- */}
      <header className={`fixed top-6 left-24 right-6 h-16 glass-panel rounded-lg flex items-center justify-between px-8 z-40 animate-appear border-t ${theme.border}/30 transition-all duration-700 ${visibilityClass}`}>
        <div className="flex items-center gap-6">
          <div className="relative group cursor-default">
            <div className={`absolute inset-0 ${theme.bg500} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse`}></div>
            <div className="relative flex items-center gap-3">
                <Hexagon className={`w-8 h-8 ${isOnline ? `${theme.text} animate-[spin_10s_linear_infinite]` : 'text-red-500'}`} strokeWidth={1.5} />
                <div className="flex flex-col">
                    <h1 className="text-2xl font-[Rajdhani] font-bold tracking-[0.25em] text-white sage-text leading-none">
                        CIEL
                    </h1>
                    <span className={`text-[10px] font-mono ${theme.text} tracking-[0.4em] opacity-80`}>
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
                  <span className={theme.text500}>MB</span>
              </div>
           </div>
           
           <div className={`h-8 w-px ${theme.bg900}/50 hidden md:block`}></div>

           <div className="flex flex-col items-end hidden md:flex">
              <span className="text-slate-500 uppercase">Active Agents</span>
              <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-bold">{status.metrics.active_agents}</span>
                  <span className="text-purple-400">UNITS</span>
              </div>
           </div>

           <div className={`h-8 w-px ${theme.bg900}/50 hidden md:block`}></div>

           <div className={`flex items-center gap-3 bg-[#000]/30 px-4 py-2 rounded-full border ${theme.border}/30 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
              <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                {isOnline ? 'LINK ESTABLISHED' : 'SEVERED'}
              </span>
           </div>
        </div>
      </header>

      {/* --- NAVIGATION DOCK (LEFT) --- */}
      <nav className={`fixed left-6 top-6 bottom-6 w-16 glass-panel rounded-lg flex flex-col items-center py-6 gap-8 z-50 animate-appear border-l ${theme.border}/30 transition-all duration-700 ${visibilityClass}`}>
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
                            ${isActive ? `${theme.bg500}/20 ${theme.text} ${theme.shadow}` : 'text-slate-500 hover:text-white hover:bg-white/5'}
                        `}
                      >
                          <Icon className="w-5 h-5" />
                          
                          {/* Tooltip */}
                          <div className="absolute left-14 bg-black/80 text-white text-[10px] font-mono py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 backdrop-blur-md">
                              {item.label}
                          </div>
                          
                          {/* Active Indicator */}
                          {isActive && <div className={`absolute -left-3 w-1 h-6 ${theme.text500} bg-current rounded-r-full shadow-[0_0_10px_current]`}></div>}
                      </button>
                  )
              })}
          </div>
          
          <div className="text-[8px] font-mono text-slate-600 rotate-180 writing-vertical tracking-widest opacity-50">
              V.12.0.0-OMEGA
          </div>
      </nav>

      {/* --- MAIN CONTENT VIEWPORT --- */}
      <main className={`absolute ${domainExpansion ? 'inset-0 z-50' : 'top-28 bottom-6 left-24 right-6 z-10'} overflow-hidden rounded-lg ${domainExpansion ? '' : 'border border-white/5 bg-[#050a14]/50 backdrop-blur-sm shadow-inner'} transition-all duration-700`}>
        {children}
      </main>

    </div>
  );
};

export default Layout;
