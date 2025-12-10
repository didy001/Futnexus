
import React, { useState, useEffect } from 'react';
import { NexusStatus } from '../types';
import { Shield, Database, Globe, Zap, Activity, Cpu, Wallet, UploadCloud, RefreshCw, Crown, X, Lock, AlertTriangle, Check, Edit3, Hand, Eye, Terminal } from 'lucide-react';
import { socketService } from '../services/socketService';

interface DashboardProps {
    status: NexusStatus;
}

const Dashboard: React.FC<DashboardProps> = ({ status }) => {
  const logs = status.logs;
  const isConnected = status.status === 'ONLINE';
  
  const [economics] = useState({
      vault: 0.0,
      treasury: 0.0,
      valuation: { infrastructure_value: 0, intellectual_capital: 0 }
  });

  const [uplinkData, setUplinkData] = useState('');
  const [uplinkStatus, setUplinkStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const [showAmbition, setShowAmbition] = useState(false);
  const [ambitionText, setAmbitionText] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [ambitionStatus, setAmbitionStatus] = useState<'IDLE' | 'LOCKED' | 'INJECTING' | 'ACCEPTED'>('LOCKED');

  const [intervention, setIntervention] = useState<any>(null);
  const [interventionInput, setInterventionInput] = useState('');

  // --- ANIMA & VISUAL STATE ---
  const [animaState, setAnimaState] = useState<any>({ boredom: 0, obsession: null, state: 'DORMANT', solvency: 'PROSPERITY' });
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());

  useEffect(() => {
      socketService.onIntervention((data) => {
          setIntervention(data);
          if (data.type === 'CO_CREATION' && data.metadata?.content) {
              setInterventionInput(data.metadata.content);
          } else {
              setInterventionInput('');
          }
      });

      // Listening to generic socket events for Anima
      socketService.getSocket()?.on('anima_pulse', (data: any) => {
          setAnimaState(data);
      });
  }, []);

  // Detect active agents from logs to animate stones
  useEffect(() => {
      if (logs.length > 0) {
          // Take the most recent logs (the ones added last in the array from the backend usually, but our app appends)
          // We look at the last 5 logs to see who is talking.
          const recentLogs = logs.slice(-5);
          const active = new Set<string>();
          
          recentLogs.forEach(log => {
             // Map log source to Stone IDs
             if (['OMEGA', 'OMEGA_NODE', 'AETHER_LINK', 'NET_RUNNER'].some(s => log.source.includes(s))) active.add('SPACE');
             if (['RAPHAEL', 'METAQUANTIQUE', 'LUCIFER', 'CEREBRO'].some(s => log.source.includes(s))) active.add('MIND');
             if (['BELSEBUTH', 'MNEMOSYNE', 'PROFIT_STREAM', 'SKILL_FORGE'].some(s => log.source.includes(s))) active.add('REALITY');
             if (['ARMORY', 'PHOENIX', 'EXECUTOR', 'WALLET_MANAGER'].some(s => log.source.includes(s))) active.add('POWER');
             if (['TACHYON', 'CHRONOS'].some(s => log.source.includes(s))) active.add('TIME');
             if (['ANIMA', 'SENTINEL', 'VISION_ARCHIVE', 'ARCHON'].some(s => log.source.includes(s))) active.add('SOUL');
          });
          
          if (active.size > 0) {
             setActiveAgents(active);
             // Clear active state after a delay to create pulsing effect
             const timer = setTimeout(() => setActiveAgents(new Set()), 1500);
             return () => clearTimeout(timer);
          }
      }
  }, [logs]);

  const handleInterventionSubmit = async (overrideValue?: string) => {
      if (!intervention) return;
      const finalValue = overrideValue || interventionInput;
      
      try {
          await fetch('http://localhost:3000/nexus/intervention/resolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: intervention.id, value: finalValue })
          });
          setIntervention(null);
          setInterventionInput('');
      } catch(e) {
          console.error("Failed to resolve intervention", e);
      }
  }

  const handleUplink = async () => {
      if (!uplinkData.trim()) return;
      setUplinkStatus('UPLOADING');
      try {
          const res = await fetch('http://localhost:3000/nexus/ingest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: uplinkData, type: 'TEXT_DIRECT', source: 'SHADOW_DASHBOARD' })
          });
          if(res.ok) {
              setUplinkStatus('SUCCESS');
              setUplinkData('');
              setTimeout(() => setUplinkStatus('IDLE'), 2000);
          } else {
              setUplinkStatus('ERROR');
          }
      } catch (e) {
          setUplinkStatus('ERROR');
      }
  }

  const handleAmbitionInject = async () => {
      if (accessCode !== 'SHADOW') { 
          alert("ACCESS DENIED. WRONG CODE.");
          return; 
      }
      setAmbitionStatus('INJECTING');
      try {
          const res = await fetch('http://localhost:3000/nexus/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  description: `PRIME DIRECTIVE: ${ambitionText}`,
                  origin: "SHADOW_PRIME_DIRECTIVE",
                  priority: 200,
                  payload: { action: "SET_GLOBAL_STRATEGY", strategy: ambitionText }
              })
          });
          
          if (res.ok) {
              setAmbitionStatus('ACCEPTED');
              setTimeout(() => {
                  setShowAmbition(false);
                  setAmbitionStatus('LOCKED');
                  setAmbitionText('');
              }, 2000);
          }
      } catch (e) {
          console.error(e);
      }
  }

  const stones = [
      { id: 'SPACE', color: '#3b82f6', label: 'OMEGA', icon: Globe, angle: 0 },
      { id: 'MIND', color: '#eab308', label: 'RAPHAEL', icon: Cpu, angle: 60 },
      { id: 'REALITY', color: '#ef4444', label: 'BELSEBUTH', icon: Database, angle: 120 },
      { id: 'POWER', color: '#a855f7', label: 'ARMORY', icon: Zap, angle: 180 },
      { id: 'TIME', color: '#22c55e', label: 'TACHYON', icon: Activity, angle: 240 },
      { id: 'SOUL', color: '#f97316', label: 'ANIMA', icon: Shield, angle: 300 },
  ];

  return (
    <div className="w-full h-full grid grid-cols-12 gap-6 overflow-y-auto pr-2 custom-scrollbar relative p-4 animate-in fade-in duration-700">
      
      {/* SHADOW THRONE BUTTON */}
      <div className="absolute top-2 right-2 z-50">
          <button 
            onClick={() => setShowAmbition(true)}
            className="group flex items-center gap-3 px-6 py-3 bg-[#ffd700]/5 border border-[#ffd700]/30 rounded-full hover:bg-[#ffd700]/10 transition-all duration-500 cursor-pointer backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]"
          >
              <span className="text-[10px] font-mono text-[#ffd700] tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  {animaState.obsession ? 'OBSESSION LOCKED' : 'SHADOW THRONE'}
              </span>
              <Crown className="w-5 h-5 text-[#ffd700] animate-[pulse_3s_ease-in-out_infinite]" />
          </button>
      </div>

      {/* --- INTERVENTION MODAL --- */}
      {intervention && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-pulse-slow">
              <div className="w-[800px] max-h-[90vh] flex flex-col bg-[#0a0a0a] border-2 border-cyan-500 rounded-xl p-8 shadow-[0_0_100px_rgba(6,182,212,0.2)] relative">
                  <div className="flex items-center gap-4 mb-6 border-b border-cyan-900/50 pb-4">
                      {intervention.type === 'CO_CREATION' ? <Edit3 className="w-8 h-8 text-cyan-400" /> : 
                       intervention.type === 'MANUAL_TASK' ? <Hand className="w-8 h-8 text-yellow-400" /> :
                       <AlertTriangle className="w-8 h-8 text-red-500" />}
                      <div>
                          <h2 className="text-xl font-[Rajdhani] font-bold text-white tracking-[0.2em] animate-pulse">
                              {intervention.type === 'CO_CREATION' ? 'SYMBIOTE REVIEW REQUESTED' : 
                               intervention.type === 'MANUAL_TASK' ? 'OPERATOR HANDOVER REQUESTED' :
                               'SYSTEM INTERVENTION REQUIRED'}
                          </h2>
                          <p className="text-xs font-mono text-cyan-500 mt-1">{intervention.description}</p>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111] rounded border border-slate-800 p-4 mb-6">
                      {intervention.type === 'CO_CREATION' ? (
                          <textarea 
                              className="w-full h-[300px] bg-transparent text-slate-300 font-mono text-xs outline-none resize-none"
                              value={interventionInput}
                              onChange={(e) => setInterventionInput(e.target.value)}
                          />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-4">
                              <input 
                                  type="text" 
                                  className="w-full bg-[#111] border border-red-900 rounded p-4 text-white font-mono text-xl text-center focus:border-red-500 outline-none"
                                  placeholder={intervention.type === 'OTP' ? "ENTER 2FA CODE" : "ENTER DATA"}
                                  value={interventionInput}
                                  onChange={(e) => setInterventionInput(e.target.value)}
                                  autoFocus
                              />
                          </div>
                      )}
                  </div>

                  <div className="flex justify-end gap-4">
                       <button 
                              onClick={() => handleInterventionSubmit()}
                              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono px-8 py-3 rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
                          >
                              <Check className="w-4 h-4" /> TRANSMIT
                          </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- AMBITION MODAL --- */}
      {showAmbition && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-[600px] bg-[#0a0a0a] border-2 border-[#ffd700] rounded-xl p-8 shadow-[0_0_50px_rgba(255,215,0,0.2)] relative">
                  <button onClick={() => setShowAmbition(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X /></button>
                  <div className="flex flex-col items-center mb-8">
                      <Crown className="w-16 h-16 text-[#ffd700] mb-4 animate-[pulse_2s_infinite]" />
                      <h2 className="text-3xl font-[Rajdhani] font-bold text-[#ffd700] tracking-[0.3em] text-center">SHADOW AMBITION</h2>
                  </div>
                  <div className="space-y-6">
                      <textarea 
                          className="w-full h-32 bg-[#111] border border-[#333] rounded p-4 text-[#ffd700] font-mono text-sm focus:border-[#ffd700] outline-none mt-2 resize-none"
                          placeholder="Describe the Empire you wish to build..."
                          value={ambitionText}
                          onChange={(e) => setAmbitionText(e.target.value)}
                      />
                      <div className="flex items-center gap-4">
                          <input 
                              type="password" 
                              className="w-full bg-[#111] border border-[#333] rounded p-3 text-white font-mono mt-2 focus:border-[#ffd700] outline-none"
                              placeholder="ACCESS CODE"
                              value={accessCode}
                              onChange={(e) => setAccessCode(e.target.value)}
                          />
                          <button onClick={handleAmbitionInject} className="bg-[#ffd700] text-black font-bold font-mono px-8 py-4 rounded mt-6 w-1/2">
                              {ambitionStatus === 'INJECTING' ? '...' : 'EXECUTE'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- LEFT: STATS & ANIMA --- */}
      <div className="col-span-3 flex flex-col gap-4">
          <div className={`glass-panel p-4 rounded-lg flex items-center gap-4 transition-all duration-500 ${animaState.solvency === 'WAR_ECONOMY' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}`}>
              <div className="relative">
                 <Shield className={`w-8 h-8 ${animaState.solvency === 'WAR_ECONOMY' ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                 <div className="absolute -bottom-1 -right-1 text-[8px] bg-black px-1 rounded border border-white/20 text-white font-mono">
                     {animaState.boredom}%
                 </div>
              </div>
              <div>
                  <div className="text-[10px] text-slate-500 font-mono">WILLPOWER ENGINE</div>
                  <div className={`text-sm font-bold ${animaState.solvency === 'WAR_ECONOMY' ? 'text-red-500' : 'text-white'}`}>
                      {animaState.obsession ? 'HYPER-FOCUSED' : animaState.state}
                  </div>
                  {animaState.obsession && (
                      <div className="text-[8px] text-[#ffd700] truncate w-32">{animaState.obsession}</div>
                  )}
              </div>
          </div>

          <div className="flex-1 glass-panel rounded-lg p-4 flex flex-col overflow-hidden">
              <h3 className="text-xs font-mono text-cyan-500 mb-3 border-b border-cyan-900/50 pb-2 flex justify-between">
                  <span>LIVE THOUGHT STREAM</span>
                  <Terminal className="w-3 h-3 text-cyan-500" />
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar">
                  {logs.map((log, i) => (
                      <div key={i} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                          <span className="text-slate-600">[{log.timestamp.split('T')[1].substring(0,8)}]</span>
                          <span className={`${log.level === 'ERROR' ? 'text-red-400' : 'text-cyan-300'} w-16 truncate`}>{log.source}</span>
                          <span className="text-slate-300 break-all opacity-80">{log.message}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* --- CENTER: REACTIVE GAUNTLET --- */}
      <div className="col-span-6 flex flex-col gap-6">
          <div className="relative h-[450px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Outer Rings */}
                  <div className={`absolute w-[400px] h-[400px] rounded-full border border-cyan-900/30 animate-[spin-slow_60s_linear_infinite] ${isConnected ? 'opacity-100' : 'opacity-20'}`}></div>
                  <div className="absolute w-[350px] h-[350px] rounded-full border border-purple-900/20 animate-[spin-slow_40s_linear_infinite_reverse]"></div>
                  
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
                                      {/* Pulse Effect when Active */}
                                      {isActive && (
                                          <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: stone.color }}></div>
                                      )}
                                      
                                      <div className={`w-10 h-10 bg-[#050a14] border-2 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all duration-200 ${isActive ? 'border-white shadow-[0_0_30px_current]' : 'border-slate-800'}`} 
                                           style={{ borderColor: isActive ? stone.color : undefined, color: stone.color, boxShadow: isActive ? `0 0 20px ${stone.color}` : undefined }}>
                                          <stone.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
                  
                  {/* Core Status */}
                  <div className="text-center z-10 flex flex-col items-center">
                      <h2 className="text-4xl font-[Rajdhani] font-bold text-white tracking-[0.2em] sage-text transition-all duration-1000">
                          {isConnected ? 'INFINITY' : 'OFFLINE'}
                      </h2>
                      <p className={`text-[10px] font-mono mt-2 tracking-[0.5em] ${activeAgents.size > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`}>
                          {activeAgents.size > 0 ? 'NEURAL UPLINK ACTIVE' : 'SYSTEM STANDBY'}
                      </p>
                  </div>
              </div>
          </div>

          {/* Quick Action / Uplink */}
          <div className="glass-panel p-4 rounded-lg flex flex-col gap-2 group hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-purple-400" /> 
                      DIRECT NEURAL UPLINK
                  </h3>
                  <span className={`text-[10px] font-bold ${uplinkStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}`}>{uplinkStatus}</span>
              </div>
              <textarea 
                  className="w-full h-16 bg-black/40 border border-slate-700 rounded-md p-2 text-xs font-mono text-slate-300 outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                  placeholder="// PASTE DATA OR STRATEGY..."
                  value={uplinkData}
                  onChange={(e) => setUplinkData(e.target.value)}
              />
              <div className="flex justify-end">
                  <button onClick={handleUplink} disabled={!uplinkData} className="bg-purple-900/30 hover:bg-purple-600/50 text-purple-200 text-xs font-mono px-4 py-1 rounded transition-all">
                      TRANSMIT
                  </button>
              </div>
          </div>
      </div>

      {/* --- RIGHT: ECONOMICS & OPS --- */}
      <div className="col-span-3 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-lg space-y-4">
              <h3 className="text-xs text-white font-bold mb-2 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-400"/> TREASURY</h3>
              
              <div className="bg-slate-900/50 p-3 rounded border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Shadow Vault (Locked)</span>
                  <div className="text-2xl font-bold text-emerald-400">${economics.vault.toFixed(2)}</div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">System Ops</span>
                  <div className="text-xl font-bold text-cyan-400">${economics.treasury.toFixed(2)}</div>
              </div>
          </div>
          
          <div className="glass-panel p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
              <h3 className="text-xs text-white font-bold mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-yellow-400" /> ACTIVE OPS
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  {animaState.solvency === 'WAR_ECONOMY' && (
                      <div className="flex justify-between items-center text-[10px] bg-red-900/20 p-2 rounded border-l-2 border-red-500 animate-pulse">
                          <span className="text-red-200">WAR ECONOMY PROTOCOL</span>
                          <span className="text-red-500 font-bold">ACTIVE</span>
                      </div>
                  )}
                  {animaState.obsession && (
                      <div className="flex justify-between items-center text-[10px] bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-500">
                          <span className="text-yellow-200 truncate w-32">{animaState.obsession}</span>
                          <span className="text-yellow-500 font-bold">PRIORITY</span>
                      </div>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;
