
import React, { useState, useEffect } from 'react';
import { INITIAL_LOGS } from '../constants';
import { SystemLog } from '../types';
import { socketService } from '../services/socketService';
import { Shield, Database, Globe, Zap, Activity, Cpu, Wallet, UploadCloud, Server, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [metrics, setMetrics] = useState({
    active_agents: 0,
    memory_rss: 0,
    knowledge_nodes: 0,
    uptime: 0
  });
  const [economics, setEconomics] = useState({
      vault: 0.0,
      treasury: 0.0,
      valuation: { infrastructure_value: 0, intellectual_capital: 0 }
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [uplinkData, setUplinkData] = useState('');
  const [uplinkStatus, setUplinkStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  useEffect(() => {
    socketService.connect((status: any) => {
        setIsConnected(true);
        if (status.metrics) setMetrics(status.metrics);
        if (status.economics) setEconomics(status.economics);
        if (status.logs && status.logs.length > 0) {
            setLogs(status.logs);
        }
    });
    return () => { socketService.disconnect(); };
  }, []);

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

  const stones = [
      { id: 'SPACE', color: '#3b82f6', label: 'OMEGA', icon: Globe, angle: 0 },
      { id: 'MIND', color: '#eab308', label: 'RAPHAEL', icon: Cpu, angle: 60 },
      { id: 'REALITY', color: '#ef4444', label: 'BELSEBUTH', icon: Database, angle: 120 },
      { id: 'POWER', color: '#a855f7', label: 'ARMORY', icon: Zap, angle: 180 },
      { id: 'TIME', color: '#22c55e', label: 'TACHYON', icon: Activity, angle: 240 },
      { id: 'SOUL', color: '#f97316', label: 'ANIMA', icon: Shield, angle: 300 },
  ];

  return (
    <div className="w-full h-full grid grid-cols-12 gap-6 overflow-y-auto pr-2 custom-scrollbar">
      
      {/* LEFT: STATS & AUTOMATION STATUS */}
      <div className="col-span-3 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-lg flex items-center gap-4">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                  <div className="text-[10px] text-slate-500 font-mono">UPTIME</div>
                  <div className="text-xl font-bold text-white">{Math.floor(metrics.uptime/60)}m</div>
              </div>
          </div>
          <div className="glass-panel p-4 rounded-lg flex items-center gap-4">
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin-slow" />
              <div>
                  <div className="text-[10px] text-slate-500 font-mono">PIPELINE</div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ZERO-TOUCH
                  </div>
              </div>
          </div>
          
          <div className="flex-1 glass-panel rounded-lg p-4 flex flex-col overflow-hidden">
              <h3 className="text-xs font-mono text-cyan-500 mb-3 border-b border-cyan-900/50 pb-2">LIVE LOGS</h3>
              <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar">
                  {logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                          <span className="text-slate-600">[{log.timestamp.split('T')[1].substring(0,8)}]</span>
                          <span className={log.level === 'ERROR' ? 'text-red-400' : 'text-cyan-300'}>{log.source}</span>
                          <span className="text-slate-300 truncate">{log.message}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* CENTER: INFINITY GAUNTLET */}
      <div className="col-span-6 flex flex-col gap-6">
          <div className="relative h-[450px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-900/30 animate-[spin-slow_60s_linear_infinite]"></div>
                  <div className="absolute w-[400px] h-[400px] animate-[spin-slow_30s_linear_infinite]">
                      {stones.map((stone) => (
                          <div key={stone.id} className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center"
                            style={{ 
                                left: `${50 + 50 * Math.cos((stone.angle * Math.PI) / 180)}%`, 
                                top: `${50 + 50 * Math.sin((stone.angle * Math.PI) / 180)}%`,
                                transform: `rotate(-${stone.angle}deg)`
                            }}>
                              <div className="relative group cursor-pointer hover:scale-125 transition-transform">
                                  <div className="w-10 h-10 bg-[#050a14] border rounded-full flex items-center justify-center" style={{ borderColor: stone.color }}>
                                      <stone.icon className="w-4 h-4" style={{ color: stone.color }} />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="text-center z-10">
                      <h2 className="text-3xl font-[Rajdhani] font-bold text-white tracking-[0.2em] sage-text">
                          {isConnected ? 'INFINITY' : 'OFFLINE'}
                      </h2>
                      <p className="text-[10px] font-mono text-cyan-400 mt-2 tracking-[0.5em]">SYSTEM ACTIVE</p>
                  </div>
              </div>
          </div>

          {/* NEURAL UPLINK */}
          <div className="glass-panel p-4 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-purple-400" /> 
                      NEURAL UPLINK
                  </h3>
                  <span className={`text-[10px] font-bold ${uplinkStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}`}>{uplinkStatus}</span>
              </div>
              <textarea 
                  className="w-full h-20 bg-black/40 border border-slate-700 rounded p-2 text-xs font-mono text-slate-300 outline-none focus:border-purple-500 transition-colors"
                  placeholder="// INJECT RAW DATA OR STRATEGY..."
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

      {/* RIGHT: ECONOMICS & CONTROLS */}
      <div className="col-span-3 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-lg space-y-4">
              <h3 className="text-xs text-white font-bold mb-2 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-400"/> TREASURY</h3>
              
              <div className="bg-slate-900/50 p-3 rounded border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Shadow Vault (Locked)</span>
                  <div className="text-2xl font-bold text-emerald-400">${economics.vault.toFixed(2)}</div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">System Ops (Active)</span>
                  <div className="text-xl font-bold text-cyan-400">${economics.treasury.toFixed(2)}</div>
              </div>
              
              <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
                  Autonomy Level: FULL
              </div>
          </div>
          
          {/* ACTIVE OPERATIONS LIST INSTEAD OF "READY TO DROP" */}
          <div className="glass-panel p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
              <h3 className="text-xs text-white font-bold mb-3">ACTIVE OPERATIONS</h3>
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded border-l-2 border-emerald-500">
                      <span className="text-slate-300">ASSET_GEN_V1</span>
                      <span className="text-emerald-500 font-bold">PUBLISHING</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded border-l-2 border-yellow-500">
                      <span className="text-slate-300">MARKET_SCAN</span>
                      <span className="text-yellow-500 font-bold">RUNNING</span>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;
