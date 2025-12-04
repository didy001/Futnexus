import React from 'react';
import { NEXUS_HIERARCHY } from '../constants';
import { NexusModule } from '../types';
import { Hexagon, Circle, Share2 } from 'lucide-react';

interface HierarchyProps {
  onSelectModule: (module: NexusModule) => void;
}

const Hierarchy: React.FC<HierarchyProps> = ({ onSelectModule }) => {
  return (
    <div className="h-full relative overflow-y-auto pb-20">
      
      <div className="text-center space-y-2 mb-16 relative z-10">
        <h2 className="text-4xl font-[Rajdhani] font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 holo-glow animate-pulse">
            NEURAL ARCHITECTURE
        </h2>
        <p className="text-cyan-600 font-mono text-xs tracking-widest">
          /// SELECT NODE TO INITIATE UPLINK
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto min-h-[800px]">
        {/* Background Connecting Lines (Simulated via SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bc13fe" />
                    <stop offset="100%" stopColor="#00f3ff" />
                </linearGradient>
            </defs>
            <path d="M50% 100 V 800" stroke="url(#lineGrad)" strokeWidth="2" />
        </svg>

        <div className="space-y-24 relative z-10">
          {NEXUS_HIERARCHY.map((grade, index) => {
            
            // Stylistic choices based on grade
            const styles = {
                1: { color: 'text-purple-400', border: 'border-purple-500', glow: 'shadow-purple-500/50', icon: Hexagon }, // Grand Sage
                2: { color: 'text-cyan-400', border: 'border-cyan-500', glow: 'shadow-cyan-500/50', icon: Share2 },     // Architects
                3: { color: 'text-emerald-400', border: 'border-emerald-500', glow: 'shadow-emerald-500/50', icon: Circle }, // Operators
                4: { color: 'text-yellow-400', border: 'border-yellow-500', glow: 'shadow-yellow-500/50', icon: Circle }   // Apprentis
            }[grade.id] || { color: 'text-slate-400', border: 'border-slate-500', glow: '', icon: Circle };

            const Icon = styles.icon;

            return (
              <div key={grade.id} className="relative">
                 {/* Grade Label */}
                 <div className="flex items-center justify-center mb-8">
                     <div className="h-px w-20 bg-gradient-to-r from-transparent to-current opacity-30"></div>
                     <div className={`mx-4 px-4 py-1 border ${styles.border} bg-[#020408] rounded-sm text-xs font-mono tracking-[0.2em] ${styles.color} uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20`}>
                        {grade.title}
                     </div>
                     <div className="h-px w-20 bg-gradient-to-l from-transparent to-current opacity-30"></div>
                 </div>

                 {/* Modules Cluster */}
                 <div className="flex flex-wrap justify-center gap-6 px-4">
                    {grade.modules.map((module) => (
                        <button
                            key={module.id}
                            onClick={() => onSelectModule(module)}
                            className={`
                                group relative w-64 h-40 bg-[#050a14]/80 backdrop-blur-md
                                border border-slate-800 ${styles.border}/30
                                hover:${styles.border} hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]
                                transition-all duration-300 ease-out
                                flex flex-col p-5 text-left overflow-hidden
                                clip-path-polygon
                            `}
                        >
                            {/* Animated Background Gradient on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${styles.color.split('-')[1]}-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            
                            {/* Connector Line (Decorative) */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 group-hover:bg-current transition-colors duration-300"></div>

                            <div className="relative z-10 flex justify-between items-start mb-3">
                                <Icon className={`w-6 h-6 ${styles.color} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform`} />
                                <span className="text-[10px] font-mono text-slate-600 group-hover:text-white">#{module.id.substring(0,3)}</span>
                            </div>

                            <h4 className="relative z-10 text-lg font-[Rajdhani] font-bold text-slate-200 group-hover:text-white group-hover:translate-x-1 transition-transform">
                                {module.name}
                            </h4>
                            <p className="relative z-10 text-[10px] text-slate-500 mt-1 font-mono leading-tight group-hover:text-slate-300">
                                {module.role}
                            </p>

                            {/* Tech Deco Elements */}
                            <div className="absolute bottom-2 right-2 flex gap-1">
                                <div className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-white animate-pulse"></div>
                                <div className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-white animate-pulse delay-75"></div>
                            </div>
                        </button>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;