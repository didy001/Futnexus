
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import OmniShell from './views/OmniShell';
import Dashboard from './views/Dashboard';
import Hierarchy from './views/Hierarchy';
import Pipeline from './views/Pipeline';
import Console from './views/Console';
import { NexusClient } from './services/nexusClient';
import { NexusStatus, NexusModule, UIState } from './types';
import { socketService } from './services/socketService';
import { Hexagon } from 'lucide-react';

type View = 'DASHBOARD' | 'CHAT' | 'HIERARCHY' | 'PIPELINE' | 'CONSOLE';

// BOOT SEQUENCE COMPONENT (THE QUIET AWAKENING)
const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "INITIALIZING CORE...",
    "CHECKING PERIMETERS...",
    "COMPRESSING MANA STREAMS...",
    "MASKING SIGNATURE...",
    "ESTABLISHING SHADOW LINK...",
    "SYSTEM READY.",
    "WELCOME."
  ];

  useEffect(() => {
    if (step < steps.length) {
      const duration = step === steps.length - 1 ? 1500 : 600; // Pause briefly on welcome
      const timer = setTimeout(() => setStep(step + 1), duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="h-screen w-full bg-[#030305] flex flex-col items-center justify-center font-mono z-50 overflow-hidden relative">
      {/* Subtle Background Pulse */}
      <div className="absolute inset-0 bg-cyan-900/5 animate-pulse"></div>
      
      <div className="w-[300px] mb-12 relative z-10">
         <Hexagon className="w-16 h-16 text-cyan-500/50 mx-auto animate-pulse mb-8" strokeWidth={0.5} />
         
         <div className="h-0.5 w-full bg-slate-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500/50 transition-all duration-300 ease-out" style={{ width: `${(step / steps.length) * 100}%` }}></div>
         </div>
      </div>
      
      <div className="h-32 flex flex-col items-center gap-2 z-10">
        {steps.slice(0, step + 1).slice(-1).map((msg, i) => ( // Show only current step for stealth feel
          <div key={i} className={`text-xs tracking-[0.3em] font-light text-slate-500 animate-appear`}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [selectedModule, setSelectedModule] = useState<NexusModule | null>(null);
  const [uiState, setUiState] = useState<UIState>({ domainExpansion: false, themeMode: 'DEFAULT' });
  
  const [status, setStatus] = useState<NexusStatus>({
    status: 'OFFLINE',
    version: 'UNKNOWN',
    metrics: { uptime: 0, memory_rss: 0, active_agents: 0, knowledge_nodes: 0 },
    logs: []
  });

  // SINGLE SOURCE OF TRUTH: App.tsx manages the socket connection
  useEffect(() => {
    // 1. Initial Fetch (HTTP)
    const fetchInitial = async () => {
      const s = await NexusClient.getStatus();
      setStatus(prev => ({ ...s, logs: [...s.logs, ...prev.logs].slice(-100) }));
    };
    fetchInitial();

    // 2. Real-time Updates (Socket)
    socketService.connect((newStatus) => {
        setStatus(prev => {
             // Dedupe logs based on ID
             const uniqueLogs = [...newStatus.logs, ...prev.logs]
                .filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)
                .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Oldest first
                .slice(-200); // Keep buffer
             
             return { 
                 ...newStatus, 
                 logs: uniqueLogs 
             };
        });
    });
    
    // Listen for Anima Pulse to change Theme
    const socket = socketService.getSocket();
    if (socket) {
        socket.on('anima_pulse', (data: any) => {
            let mode: UIState['themeMode'] = 'DEFAULT';
            if (data.solvency === 'WAR_ECONOMY') mode = 'WAR';
            else if (data.obsession) mode = 'GOLD';
            else if (data.state === 'DORMANT') mode = 'VOID';
            
            setUiState(prev => ({ ...prev, themeMode: mode }));
        });
    }

    return () => socketService.disconnect();
  }, []);

  const handleModuleSelect = (mod: NexusModule) => {
      setSelectedModule(mod);
      setCurrentView('CONSOLE');
  };

  const toggleDomainExpansion = () => {
      setUiState(prev => ({ ...prev, domainExpansion: !prev.domainExpansion }));
  };

  if (!bootComplete) {
    return <BootSequence onComplete={() => setBootComplete(true)} />;
  }

  return (
    <Layout 
        status={status} 
        currentView={currentView} 
        onNavigate={setCurrentView}
        uiState={uiState}
    >
      {currentView === 'DASHBOARD' && <Dashboard status={status} uiState={uiState} onToggleDomain={toggleDomainExpansion} />}
      {currentView === 'CHAT' && <OmniShell status={status} />}
      {currentView === 'HIERARCHY' && <Hierarchy onSelectModule={handleModuleSelect} />}
      {currentView === 'PIPELINE' && <Pipeline />}
      {currentView === 'CONSOLE' && <Console activeModule={selectedModule} />}
    </Layout>
  );
};

export default App;
