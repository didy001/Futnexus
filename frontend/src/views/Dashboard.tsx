
import React, { useState, useEffect, useRef } from 'react';
import { NexusStatus, SystemLog, UIState } from '../types';
import { Shield, Database, Globe, Zap, Activity, Cpu, Wallet, UploadCloud, RefreshCw, Crown, X, Lock, AlertTriangle, Check, Edit3, Hand, Eye, Terminal, TrendingUp, DollarSign, Sword, Skull, BrainCircuit, Network, Unlock, Ghost, Send } from 'lucide-react';
import { socketService } from '../services/socketService';
import { NexusClient } from '../services/nexusClient';

interface DashboardProps {
    status: NexusStatus;
    uiState: UIState;
    onToggleDomain: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ status: initialStatus, uiState, onToggleDomain }) => {
  const [logs, setLogs] = useState<SystemLog[]>(initialStatus.logs);
  const [metrics, setMetrics] = useState(initialStatus.metrics);
  const isConnected = initialStatus.status === 'ONLINE'; 
  
  // ECONOMICS (HP)
  const [economics, setEconomics] = useState({
      vault: 0.0,
      treasury: 0.0,
      revenue_month: 0.0,
      expenses_month: 0.0,
      net_profit: 0.0,
      target_month: 5000.0,
      solvency: 'PROSPERITY',
      burn_rate: 0
  });

  // PLAYER STATS (EVOLUTION)
  const [playerStats, setPlayerStats] = useState({
      name: "SHADOW",
      job: "MONARCH OF CODE",
      title: "NEOPHYTE",
      rank: "E-RANK",
      level: 1,
      xp_current: 0,
      xp_next: 1000,
      progress_percent: 0,
      active_perks: { // Default Display
          model_tier: "BASIC",
          spending_limit_daily: 10,
          max_parallel_agents: 2,
          can_rewrite_kernel: false
      }
  });

  const [uplinkData, setUplinkData] = useState('');
  const [uplinkStatus, setUplinkStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [showAmbition, setShowAmbition] = useState(false);
  const [ambitionText, setAmbitionText] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [intervention, setIntervention] = useState<any>(null);
  const [interventionInput, setInterventionInput] = useState('');
  const [animaState, setAnimaState] = useState<any>({ boredom: 0, obsession: null, state: 'DORMANT', solvency: 'PROSPERITY' });
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  
  // DOMAIN EXPANSION CHAT
  const [domainInput, setDomainInput] = useState('');
  const [domainHistory, setDomainHistory] = useState<{role: string, text: string}[]>([]);
  const domainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      socketService.onIntervention((data) => {
          setIntervention(data);
          if (data.type === 'CO_CREATION' && data.metadata?.content) setInterventionInput(data.metadata.content);
          else setInterventionInput('');
      });

      const socket = socketService.getSocket();
      if (socket) {
          socket.on('anima_pulse', (data: any) => {
              setAnimaState(data);
          });
          socket.on('metrics_update', (data: any) => setMetrics(data));
          socket.on('evolution_update', (data: any) => {
              setPlayerStats(prev => ({
                  ...prev,
                  level: data.level,
                  xp_current: data.current_xp,
                  xp_next: data.next_xp,
                  rank: data.rank,
                  title: data.title,
                  progress_percent: data.progress_percent,
                  active_perks: data.active_perks || prev.active_perks
              }));
          });
          socket.on('log_stream', (logEntry: SystemLog) => {
             setLogs(prev => [logEntry, ...prev].slice(0, 200));
             triggerAgentVisual(logEntry.source);
          });
      }
  }, []);

  const triggerAgentVisual = (source: string) => {
     let stoneId = '';
     if (['OMEGA', 'OMEGA_NODE', 'AETHER_LINK', 'NET_RUNNER'].some(s => source.includes(s))) stoneId = 'SPACE';
     if (['RAPHAEL', 'METAQUANTIQUE', 'LUCIFER', 'CEREBRO'].some(s => source.includes(s))) stoneId = 'MIND';
     if (['BELSEBUTH', 'MNEMOSYNE', 'PROFIT_STREAM', 'SKILL_FORGE', 'GENERATOR'].some(s => source.includes(s))) stoneId = 'REALITY';
     if (['ARMORY', 'PHOENIX', 'EXECUTOR', 'WALLET_MANAGER', 'KABUTO'].some(s => source.includes(s))) stoneId = 'POWER';
     if (['TACHYON', 'CHRONOS'].some(s => source.includes(s))) stoneId = 'TIME';
     if (['ANIMA', 'SENTINEL', 'VISION_ARCHIVE', 'ARCHON'].some(s => source.includes(s))) stoneId = 'SOUL';
     
     if (stoneId) {
         setActiveAgents(prev => { const s = new Set(prev); s.add(stoneId); return s; });
         setTimeout(() => setActiveAgents(prev => { const s = new Set(prev); s.delete(stoneId); return s; }), 800);
     }
  };

  const handleInterventionSubmit = async (overrideValue?: string) => {
      if (!intervention) return;
      try {
          await fetch('http://localhost:3000/nexus/intervention/resolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: intervention.id, value: overrideValue || interventionInput })
          });
          setIntervention(null);
          setInterventionInput('');
      } catch(e) { console.error(e); }
  }

  const handleUplink = async () => {
      if (!uplinkData.trim()) return;
      setUplinkStatus('UPLOADING');
      try {
          await fetch('http://localhost:3000/nexus/ingest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: uplinkData, type: 'TEXT_DIRECT', source: 'SHADOW_DASHBOARD' })
          });
          setUplinkStatus('SUCCESS'); setUplinkData('');
          setTimeout(() => setUplinkStatus('IDLE'), 2000);
      } catch (e) { setUplinkStatus('ERROR'); }
  }

  const handleDomainCommand = async () => {
      if (!domainInput.trim()) return;
      const cmd = domainInput;
      setDomainInput('');
      setDomainHistory(prev => [...prev, {role: 'user', text: cmd}]);
      
      const response = await NexusClient.sendCommand(cmd);
      setDomainHistory(prev => [...prev, {role: 'model', text: response.content}]);
  }

  // --- THEME ENGINE (JIT SAFE) ---
  const getThemeClasses = () => {
      switch (uiState.themeMode) {
          case 'WAR':
              return {
                  text: 'text-red-400',
                  text500: 'text-red-500',
                  bg500: 'bg-red-500',
                  bg900: 'bg-red-900',
                  border: 'border-red-500',
                  shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
                  logText: 'text-red-300'
              };
          case 'GOLD':
              return {
                  text: 'text-yellow-400',
                  text500: 'text-yellow-500',
                  bg500: 'bg-yellow-500',
                  bg900: 'bg-yellow-900',
                  border: 'border-yellow-500',
                  shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
                  logText: 'text-yellow-300'
              };
          default: // DEFAULT / VOID
              return {
                  text: 'text-cyan-400',
                  text500: 'text-cyan-500',
                  bg500: 'bg-cyan-500',
                  bg900: 'bg-cyan-900',
                  border: 'border-cyan-500',
                  shadow: 'shadow-[0_0_30px_rgba(0,243,255,0.2)]',
                  logText: 'text-cyan-300'
              };
      }
  };

  const theme = getThemeClasses();

  const stones = [
      { id: 'SPACE', color: '#3b82f6', label: 'OMEGA', icon: Globe, angle: 0 },
      { id: 'MIND', color: '#eab308', label: 'RAPHAEL', icon: Cpu, angle: 60 },
      { id: 'REALITY', color: '#ef4444', label: 'BELSEBUTH', icon: Database, angle: 120 },
      { id: 'POWER', color: '#a855f7', label: 'ARMORY', icon: Zap, angle: 180 },
      { id: 'TIME', color: '#22c55e', label: 'TACHYON', icon: Activity, angle: 240 },
      { id: 'SOUL', color: '#f97316', label: 'ANIMA', icon: Shield, angle: 300 },
  ];

  // Calculations for Bars
  const hpPercent = Math.min(100, Math.max(0, (economics.treasury / 100) * 100)); 
  const mpPercent = 100 - (metrics.memory_rss / 1024) * 100; 

  // DOMAIN EXPANSION CLASS OVERRIDES
  if (uiState.domainExpansion) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-transparent overflow-hidden">
              {/* EXIT BUTTON */}
              <button onClick={onToggleDomain} className="absolute top-10 right-10 text-white/20 hover:text-white z-50">
                  <X className="w-8 h-8" />
              </button>

              {/* FLOATING CHAT LOGS */}
              <div className="absolute top-1/4 w-1/3 flex flex-col gap-4 pointer-events-none">
                  {domainHistory.slice(-3).map((msg, i) => (
                      <div key={i} className={`text-center font-mono ${msg.role === 'user' ? 'text-white/50 text-sm' : `${theme.text} text-lg drop-shadow-[0_0_10px_current]`}`}>
                          {msg.text}
                      </div>
                  ))}
              </div>

              {/* CENTRAL EYE */}
              <div className="relative z-10 scale-150">
                  <div className={`absolute -inset-20 ${theme.bg500}/20 blur-3xl rounded-full animate-pulse`}></div>
                  <div className={`w-64 h-64 border-4 ${theme.border} rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite] shadow-[0_0_100px_current]`}>
                      <div className={`w-48 h-48 border-2 ${theme.border}/50 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite_reverse]`}>
                          <Crown className={`w-24 h-24 text-white drop-shadow-[0_0_20px_white] animate-pulse`} strokeWidth={1} />
                      </div>
                  </div>
              </div>

              {/* INPUT VOID */}
              <div className="absolute bottom-1/4 w-1/2 max-w-2xl">
                  <input 
                    ref={domainInputRef}
                    className={`w-full bg-transparent border-b ${theme.border}/30 text-center text-3xl font-[Rajdhani] font-bold text-white placeholder-white/20 outline-none focus:${theme.border} transition-all pb-4`}
                    placeholder="SPEAK YOUR WILL"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDomainCommand()}
                    autoFocus
                  />
              </div>
          </div>
      );
  }

  // STANDARD DASHBOARD
  return (
    <div className={`w-full h-full grid grid-cols-12 gap-6 overflow-y-auto pr-2 custom-scrollbar relative p-4 animate-in fade-in duration-700 bg-black/40`}>
      
      {/* --- SOLO LEVELING STATUS WINDOW (LEFT) --- */}
      <div className="col-span-4 flex flex-col gap-6">
          <div className={`glass-panel p-6 rounded-sm border-l-4 ${theme.border} shadow-[0_0_30px_rgba(0,0,0,0.2)] relative overflow-hidden group transition-all duration-500`}>
              {/* Decorative Lines */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${uiState.themeMode === 'WAR' ? 'red' : uiState.themeMode === 'GOLD' ? 'yellow' : 'cyan'}-500/10 to-transparent pointer-events-none`}></div>
              
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h2 className="text-3xl font-[Rajdhani] font-bold text-white tracking-[0.1em]">{playerStats.name}</h2>
                      <div className={`${theme.text} font-mono text-xs tracking-widest mt-1`}>[ {playerStats.job} ]</div>
                  </div>
                  <div className="text-right">
                      <div className="text-4xl font-bold text-white font-[Rajdhani]">LVL.{playerStats.level}</div>
                      <div className={`text-[10px] font-mono tracking-widest ${playerStats.rank.includes('MONARCH') ? 'text-purple-400' : 'text-slate-500'}`}>
                          {playerStats.rank}
                      </div>
                  </div>
              </div>

              {/* TITLE */}
              <div className="mb-6 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">TITLE:</span>
                  <span className="text-xs text-white font-bold bg-white/10 px-2 py-1 rounded border border-white/20">{playerStats.title}</span>
              </div>

              {/* BARS */}
              <div className="space-y-4 font-mono text-[10px] tracking-widest">
                  
                  {/* HP (Funds) */}
                  <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                          <span>HP (FUNDS)</span>
                          <span className={economics.treasury < 10 ? "text-red-500 animate-pulse" : "text-white"}>{economics.treasury.toFixed(2)} / ∞</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
                          <div style={{ width: `${hpPercent}%` }} className={`h-full transition-all duration-1000 ${economics.treasury < 10 ? "bg-red-600" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`}></div>
                      </div>
                  </div>

                  {/* MP (Compute) */}
                  <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                          <span>MP (COMPUTE)</span>
                          <span className="text-blue-400">{Math.round(mpPercent)}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
                          <div style={{ width: `${mpPercent}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-1000"></div>
                      </div>
                  </div>

                  {/* XP (Growth) */}
                  <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                          <span>XP (ASCENSION)</span>
                          <span className="text-[#ffd700]">{Math.round(playerStats.progress_percent)}%</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-sm overflow-hidden relative">
                          <div style={{ width: `${playerStats.progress_percent}%` }} className="h-full bg-[#ffd700] shadow-[0_0_10px_#ffd700] transition-all duration-1000 relative z-10"></div>
                          {/* Infinite glow if maxed */}
                          {playerStats.progress_percent >= 100 && <div className="absolute inset-0 bg-[#ffd700] blur-sm animate-pulse"></div>}
                      </div>
                      <div className="text-right text-[8px] text-slate-600 mt-1">{playerStats.xp_current} / {playerStats.xp_next}</div>
                  </div>

              </div>

              {/* PERKS / CAPABILITIES */}
              <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="text-[10px] text-slate-500 font-mono mb-2 tracking-widest">ACTIVE AUTHORITY:</div>
                  <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                          <BrainCircuit className={`w-3 h-3 ${theme.text}`} />
                          <div>
                              <div className="text-[8px] text-slate-500">COGNITION</div>
                              <div className="text-[10px] text-white font-bold">{playerStats.active_perks.model_tier}</div>
                          </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                          <Wallet className="w-3 h-3 text-emerald-400" />
                          <div>
                              <div className="text-[8px] text-slate-500">DAILY LIMIT</div>
                              <div className="text-[10px] text-white font-bold">${playerStats.active_perks.spending_limit_daily}</div>
                          </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                          <Network className="w-3 h-3 text-purple-400" />
                          <div>
                              <div className="text-[8px] text-slate-500">AGENTS</div>
                              <div className="text-[10px] text-white font-bold">{playerStats.active_perks.max_parallel_agents} MAX</div>
                          </div>
                      </div>
                      {playerStats.active_perks.can_rewrite_kernel && (
                          <div className="bg-red-900/20 p-2 rounded border border-red-500/50 flex items-center gap-2 animate-pulse">
                              <Unlock className="w-3 h-3 text-red-500" />
                              <div className="text-[9px] text-red-400 font-bold">KERNEL UNLOCKED</div>
                          </div>
                      )}
                  </div>
              </div>

              {/* FATIGUE */}
              <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-[10px] text-slate-400 font-mono">FATIGUE:</span>
                  <span className="text-xs text-orange-400 font-bold">{animaState.boredom} / 100</span>
              </div>
          </div>

          {/* ACTIVE QUESTS (LOGS) */}
          <div className="flex-1 glass-panel rounded-sm p-0 flex flex-col overflow-hidden border border-slate-800">
              <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex justify-between items-center">
                  <h3 className={`text-xs font-mono ${theme.text500} flex items-center gap-2`}>
                      <Terminal className="w-3 h-3" /> SYSTEM LOG
                  </h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar p-3">
                  {logs.map((log, i) => (
                      <div key={i} className="flex gap-2 animate-in slide-in-from-left-2 duration-300 group hover:bg-white/5 p-1 rounded">
                          <span className="text-slate-600">[{log.timestamp.split('T')[1].substring(0,8)}]</span>
                          <span className={`${log.level === 'ERROR' ? 'text-red-400' : theme.logText} w-16 truncate group-hover:w-auto transition-all`}>{log.source}</span>
                          <span className="text-slate-300 break-all opacity-80 group-hover:text-white">{log.message}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* --- CENTER: THE GATE (VISUALIZER) --- */}
      <div className="col-span-5 flex flex-col gap-6 relative">
          
          {/* SHADOW ARMY VISUALIZER */}
          <div className="relative h-[500px] flex items-center justify-center border border-white/5 bg-black/20 rounded-full aspect-square mx-auto">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Magic Circles */}
                  <div className={`absolute w-[400px] h-[400px] rounded-full border ${theme.border}/20 animate-[spin-slow_60s_linear_infinite] ${isConnected ? 'opacity-100' : 'opacity-20'}`}></div>
                  <div className="absolute w-[300px] h-[300px] rounded-full border border-purple-500/20 animate-[spin-slow_40s_linear_infinite_reverse]"></div>
                  <div className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/10 animate-[spin-slow_20s_linear_infinite]"></div>
                  
                  {/* Stones Container */}
                  <div className="absolute w-[400px] h-[400px] animate-[spin-slow_30s_linear_infinite]">
                      {stones.map((stone) => {
                          const isActive = activeAgents.has(stone.id);
                          return (
                              <div key={stone.id} className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center transition-all duration-300"
                                style={{ 
                                    left: `${50 + 50 * Math.cos((stone.angle * Math.PI) / 180)}%`, 
                                    top: `${50 + 50 * Math.sin((stone.angle * Math.PI) / 180)}%`,
                                    transform: `rotate(-${stone.angle}deg) ${isActive ? 'scale(1.5)' : 'scale(1)'}`
                                }}>
                                  <div className="relative group cursor-pointer pointer-events-auto">
                                      {/* Spirit Flame */}
                                      {isActive && (
                                          <div className={`absolute -inset-4 ${theme.bg500}/30 blur-xl rounded-full animate-pulse`}></div>
                                      )}
                                      
                                      <div className={`w-10 h-10 bg-[#050a14] border-2 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all duration-200 ${isActive ? `${theme.border} shadow-[0_0_30px_currentColor] text-white` : 'border-slate-800 text-slate-600'}`}>
                                          <stone.icon className="w-4 h-4" />
                                      </div>
                                      <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest transition-opacity ${isActive ? `opacity-100 ${theme.text}` : 'opacity-0'}`}>
                                          {stone.label}
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
                  
                  {/* Core Status */}
                  <div className="text-center z-10 flex flex-col items-center">
                      <Crown className={`w-12 h-12 mb-4 transition-all duration-1000 ${isConnected ? `text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]` : 'text-slate-800'}`} strokeWidth={1} />
                      <h2 className="text-4xl font-[Rajdhani] font-bold text-white tracking-[0.2em] sage-text transition-all duration-1000">
                          {isConnected ? 'ARISE' : 'VOID'}
                      </h2>
                      <p className={`text-[10px] font-mono mt-2 tracking-[0.5em] ${activeAgents.size > 0 ? `${theme.text} animate-pulse` : 'text-slate-600'}`}>
                          {activeAgents.size > 0 ? 'SHADOW EXTRACTION' : 'SYSTEM READY'}
                      </p>
                  </div>
              </div>
          </div>

          {/* Quick Action / Uplink */}
          <div className="glass-panel p-4 rounded-sm flex flex-col gap-2 group hover:border-cyan-500/30 transition-colors border border-slate-800">
              <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-mono text-white flex items-center gap-2`}>
                      <UploadCloud className={`w-4 h-4 ${theme.text}`} /> 
                      DIRECT UPLINK (QUEST INJECTION)
                  </h3>
                  <span className={`text-[10px] font-bold ${uplinkStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}`}>{uplinkStatus}</span>
              </div>
              <textarea 
                  className={`w-full h-16 bg-black/40 border border-slate-700 rounded-sm p-2 text-xs font-mono text-slate-300 outline-none focus:${theme.border} transition-all placeholder:text-slate-700`}
                  placeholder="// ENTER COMMAND..."
                  value={uplinkData}
                  onChange={(e) => setUplinkData(e.target.value)}
              />
              <div className="flex justify-end">
                  <button onClick={handleUplink} disabled={!uplinkData} className={`${theme.bg900}/30 hover:${theme.bg900}/50 ${theme.text} text-xs font-mono px-4 py-1 rounded-sm transition-all border ${theme.border}/50`}>
                      SEND COMMAND
                  </button>
              </div>
          </div>
      </div>

      {/* --- RIGHT: INVENTORY & SHOP --- */}
      <div className="col-span-3 flex flex-col gap-4">
          
          {/* DAILY QUEST */}
          <div className="glass-panel p-4 rounded-sm border-l-2 border-[#ffd700] space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center">
                  <h3 className="text-xs text-[#ffd700] font-bold tracking-widest">DAILY QUEST</h3>
                  <span className="text-[10px] bg-[#ffd700]/20 text-[#ffd700] px-2 rounded">INCOMPLETE</span>
              </div>
              <div className="text-sm text-white font-[Rajdhani] font-bold">MAKE $50 PROFIT</div>
              <p className="text-[10px] text-slate-400 font-mono">Penalty: System enters War Economy Mode.</p>
              
              {/* Gold Bar Visual */}
              <div className="h-1 w-full bg-slate-800 mt-2 rounded-full overflow-hidden">
                  <div style={{ width: `${(economics.revenue_month / 50) * 100}%` }} className="h-full bg-[#ffd700]"></div>
              </div>
          </div>

          {/* EQUIPMENT (AGENTS) */}
          <div className="glass-panel p-4 rounded-sm flex-1 flex flex-col border border-slate-800">
              <h3 className="text-xs text-white font-bold mb-3 flex items-center gap-2">
                  <Sword className="w-4 h-4 text-purple-400" /> SHADOW SOLDIERS
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  {[
                      { name: 'BELSEBUTH', rank: 'GENERAL', status: 'IDLE' },
                      { name: 'MERCATOR', rank: 'COMMANDER', status: 'HUNTING' },
                      { name: 'LUCIFER', rank: 'ASSASSIN', status: 'IDLE' },
                      { name: 'HYPNOS', rank: 'MAGE', status: 'WEAVING' },
                  ].map((agent, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded border border-slate-800 hover:border-purple-500/50 transition-colors group cursor-pointer">
                          <div>
                              <div className="text-slate-200 font-bold group-hover:text-purple-300">{agent.name}</div>
                              <div className="text-slate-600">{agent.rank}</div>
                          </div>
                          <div className={`text-[9px] px-2 py-0.5 rounded ${agent.status === 'IDLE' ? 'bg-slate-800 text-slate-500' : 'bg-purple-900/50 text-purple-300 animate-pulse'}`}>
                              {agent.status}
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* DOMAIN EXPANSION BUTTON (The 'Game Over' Button) */}
          <button 
            onClick={onToggleDomain}
            className={`w-full py-4 ${theme.bg500}/10 border ${theme.border}/30 ${theme.text} font-[Rajdhani] font-bold tracking-[0.2em] hover:${theme.bg500}/20 transition-all flex items-center justify-center gap-2 group`}
          >
              <Ghost className="w-4 h-4 group-hover:scale-125 transition-transform" /> 
              DOMAIN EXPANSION
          </button>

      </div>

      {/* --- INTERVENTION MODAL --- */}
      {intervention && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-pulse-slow">
              <div className="w-[800px] max-h-[90vh] flex flex-col bg-[#0a0a0a] border-2 border-red-500 rounded-sm p-8 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                  <div className="flex items-center gap-4 mb-6 border-b border-red-900/50 pb-4">
                      <Skull className="w-10 h-10 text-red-500" />
                      <div>
                          <h2 className="text-2xl font-[Rajdhani] font-bold text-red-500 tracking-[0.2em]">EMERGENCY QUEST</h2>
                          <p className="text-xs font-mono text-white mt-1">PLAYER INTERVENTION REQUIRED: {intervention.description}</p>
                      </div>
                  </div>
                  <div className="flex-1 bg-[#111] rounded-sm p-4 mb-6 overflow-y-auto custom-scrollbar border border-red-900/30">
                      {intervention.type === 'CO_CREATION' ? 
                        <textarea className="w-full h-40 bg-transparent text-slate-300 font-mono text-xs outline-none resize-none" value={interventionInput} onChange={(e) => setInterventionInput(e.target.value)} /> :
                        <input className="w-full bg-transparent text-white font-mono text-xl text-center outline-none" value={interventionInput} onChange={(e) => setInterventionInput(e.target.value)} placeholder="ENTER KEY" autoFocus />
                      }
                  </div>
                  <div className="flex justify-end"><button onClick={() => handleInterventionSubmit()} className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-sm text-white font-bold font-mono transition-all">COMPLETE QUEST</button></div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;
