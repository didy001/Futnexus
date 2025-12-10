
import React, { useState } from 'react';
import { generateBlueprint } from '../services/geminiService';
import { ArrowRight, CheckCircle, Code, Database, FileText, Play, Loader2, DollarSign, TrendingUp, Package, Globe, Cpu, Zap, ShoppingCart, Terminal, Share2, MessageCircle, Briefcase } from 'lucide-react';
import { NexusClient } from '../services/nexusClient';

const Pipeline: React.FC = () => {
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [productReady, setProductReady] = useState<any>(null);

  const protocols = [
    {
      id: "TREND_HUNTER",
      name: "TREND HUNTER V2",
      icon: TrendingUp,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      desc: "Scans Reddit/X for pain points. Builds a solution. Lists it for sale.",
      roi: "HIGH RISK / HIGH YIELD",
      cost: "COMPUTE HEAVY"
    },
    {
      id: "IGNITION_MICRO_TOOL_20",
      name: "MICRO-SAAS FACTORY",
      icon: Cpu,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      desc: "Generates single-file HTML tools (Calculators, Converters) for SEO arbitrage.",
      roi: "PASSIVE INCOME",
      cost: "LOW COST"
    },
    {
      id: "REDDIT_INFILTRATOR",
      name: "REDDIT HIVE MIND",
      icon: MessageCircle,
      color: "text-orange-400",
      border: "border-orange-500/30",
      desc: "Infiltrates subreddits. Detects questions. Generates helpful, authoritative answers.",
      roi: "ORGANIC TRAFFIC",
      cost: "REPUTATION RISK"
    },
    {
      id: "TWITTER_THOUGHT_LEADER",
      name: "X/TWITTER GHOST",
      icon: Share2,
      color: "text-blue-400",
      border: "border-blue-500/30",
      desc: "Scrapes trending tech news and generates viral threads.",
      roi: "AUDIENCE GROWTH",
      cost: "HIGH FREQUENCY"
    },
    {
      id: "LINKEDIN_PROFESSIONAL",
      name: "LINKEDIN AUTHORITY",
      icon: Briefcase,
      color: "text-indigo-400",
      border: "border-indigo-500/30",
      desc: "Drafts B2B thought leadership articles to attract high-ticket leads.",
      roi: "HIGH TICKET",
      cost: "BRAND EQUITY"
    },
    {
      id: "QUICK_ASSET_FLIP",
      name: "ASSET FLIPPER",
      icon: Zap,
      color: "text-yellow-400",
      border: "border-yellow-500/30",
      desc: "Identifies service arbitrage opportunities and spins up landing pages.",
      roi: "QUICK CASH",
      cost: "SPEED FOCUSED"
    }
  ];

  const executeProtocol = async (protocolId: string) => {
    setActiveProtocol(protocolId);
    setIsRunning(true);
    setExecutionLog([`[INIT] Initializing ${protocolId} sequence...`]);
    setProductReady(null);

    try {
        // Trigger backend execution
        const res = await fetch('http://localhost:3000/nexus/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: `EXECUTE FACTORY PROTOCOL: ${protocolId}`,
                origin: "UI_FACTORY",
                priority: 100,
                payload: {
                    action: "RUN_WORKFLOW",
                    workflow: { type: "BLUEPRINT_LOOKUP", id: protocolId }, // Backend will lookup blueprint
                    inputs: { topic: "AI Automation" } // Default topic
                }
            })
        });

        // Simulate stream (In real version, we listen to socket 'agent_trace')
        simulateProgress(protocolId);

    } catch (e) {
        setExecutionLog(prev => [...prev, `[ERROR] Connection Failed.`]);
        setIsRunning(false);
    }
  };

  const simulateProgress = (id: string) => {
      const steps = [
          { msg: "[MERCATOR] Scanning market verticals...", delay: 1000 },
          { msg: "[LUCIFER] Identifying high-value keywords...", delay: 3000 },
          { msg: "[BELSEBUTH] Generating source code...", delay: 6000 },
          { msg: "[HYPNOS] Designing Narrative Arc & Social Hooks...", delay: 7000 },
          { msg: "[KALEIDOS] Designing brand identity...", delay: 9000 },
          { msg: "[CRYPTO_MERCHANT] Creating Sell Order...", delay: 12000 },
          { msg: "[OMEGA] Deploying public assets...", delay: 14000 },
      ];

      let i = 0;
      const interval = setInterval(() => {
          if (i >= steps.length) {
              clearInterval(interval);
              setIsRunning(false);
              setExecutionLog(prev => [...prev, `[SUCCESS] Protocol ${id} Completed.`]);
              setProductReady({
                  name: `${id}_BUILD_${Date.now().toString().substring(8)}`,
                  price: "0.01 ETH",
                  link: "http://localhost:3000/public/product.zip"
              });
              return;
          }
          setExecutionLog(prev => [...prev, steps[i].msg]);
          i++;
      }, 2000);
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
          <div>
              <h2 className="text-3xl font-[Rajdhani] font-bold text-white tracking-[0.2em] flex items-center gap-3">
                  <Package className="w-8 h-8 text-cyan-400" /> 
                  VALUE FACTORY
              </h2>
              <p className="text-xs font-mono text-slate-500 mt-2">
                  /// MIDAS PROTOCOL: ACTIVE. SELECT PRODUCTION OR INFLUENCE LINE.
              </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
             <div className="bg-slate-900 px-4 py-2 rounded border border-slate-700 text-slate-400">
                 AVAILABLE COMPUTE: <span className="text-emerald-400">100%</span>
             </div>
             <div className="bg-slate-900 px-4 py-2 rounded border border-slate-700 text-slate-400">
                 MARKET STATUS: <span className="text-emerald-400">LIQUID</span>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
          
          {/* PROTOCOL GRID */}
          <div className="col-span-8 grid grid-cols-2 gap-4 content-start overflow-y-auto custom-scrollbar pr-2">
              {protocols.map((p) => {
                  const Icon = p.icon;
                  return (
                      <button 
                        key={p.id}
                        onClick={() => executeProtocol(p.id)}
                        disabled={isRunning}
                        className={`
                            relative group p-6 rounded-xl border bg-[#050a14] text-left transition-all duration-300
                            ${p.border} hover:bg-white/5 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                          <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-600 border border-slate-800 px-2 py-1 rounded bg-black">
                              {p.roi}
                          </div>
                          
                          <div className={`w-12 h-12 rounded-lg bg-black border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${p.color}`}>
                              <Icon className="w-6 h-6" />
                          </div>
                          
                          <h3 className={`text-lg font-bold font-[Rajdhani] tracking-wider text-white mb-2 group-hover:${p.color} transition-colors`}>
                              {p.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">
                              {p.desc}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                              REQ: {p.cost}
                          </div>
                          
                          {/* Hover Glitch Effect */}
                          <div className="absolute inset-0 border border-transparent group-hover:border-white/10 rounded-xl pointer-events-none"></div>
                      </button>
                  )
              })}
          </div>

          {/* EXECUTION MONITOR */}
          <div className="col-span-4 flex flex-col gap-4">
              <div className="flex-1 bg-black/40 border border-slate-800 rounded-xl p-4 flex flex-col overflow-hidden backdrop-blur-md">
                  <h3 className="text-xs font-mono text-cyan-500 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Terminal className="w-4 h-4" /> LIVE PRODUCTION LOG
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar">
                      {executionLog.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                              <Loader2 className="w-8 h-8 animate-spin-slow opacity-20" />
                              <span>STANDBY...</span>
                          </div>
                      )}
                      {executionLog.map((log, i) => (
                          <div key={i} className="animate-in slide-in-from-left-2 text-slate-300 border-l border-slate-700 pl-2">
                              <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                              {log}
                          </div>
                      ))}
                      {isRunning && (
                           <div className="animate-pulse text-cyan-500 border-l border-cyan-500 pl-2">
                               _ PROCESSING...
                           </div>
                      )}
                  </div>
              </div>

              {/* OUTPUT CARD */}
              <div className={`h-40 rounded-xl border transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden ${productReady ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-900/20 border-slate-800'}`}>
                  {productReady ? (
                      <div className="text-center z-10 animate-in zoom-in duration-300">
                          <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-bold tracking-widest text-sm">ASSET READY</span>
                          </div>
                          <h4 className="text-white font-[Rajdhani] text-lg mb-1">{productReady.name}</h4>
                          <div className="text-xs font-mono text-slate-400 mb-3">Listed for: <span className="text-emerald-400 font-bold">{productReady.price}</span></div>
                          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-2 mx-auto transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                              <ShoppingCart className="w-3 h-3" /> VIEW MARKET LINK
                          </button>
                      </div>
                  ) : (
                      <div className="text-center opacity-30">
                          <Package className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                          <span className="text-xs font-mono text-slate-500">NO OUTPUT</span>
                      </div>
                  )}
                  {/* Background Grid */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBMMTQwIDBoMXYxSDB6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-20"></div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default Pipeline;
