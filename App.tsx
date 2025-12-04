
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import OmniShell from './views/OmniShell';
import { NexusClient } from './services/nexusClient';
import { NexusStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<NexusStatus>({
    status: 'OFFLINE',
    version: 'UNKNOWN',
    metrics: { uptime: 0, memory_rss: 0, active_agents: 0, knowledge_nodes: 0 },
    logs: []
  });

  // THE HEARTBEAT: Poll backend every 1.5s
  useEffect(() => {
    const fetchStatus = async () => {
      const newStatus = await NexusClient.getStatus();
      setStatus(prev => {
         // Merge logs intelligently to avoid visual jitter
         const uniqueLogs = [...newStatus.logs, ...prev.logs]
            .filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i) // Dedupe
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .slice(-100); // Keep last 100
         
         return { ...newStatus, logs: uniqueLogs };
      });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout status={status}>
      <OmniShell status={status} />
    </Layout>
  );
};

export default App;
