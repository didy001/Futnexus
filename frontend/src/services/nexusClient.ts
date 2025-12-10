
import { NexusStatus, AgentResponse } from '../types';

const CORE_URL = "http://localhost:3000";

export class NexusClient {
  
  /**
   * Récupère le pouls du système (Logs, Métriques, Statut)
   */
  static async getStatus(): Promise<NexusStatus> {
    try {
      const res = await fetch(`${CORE_URL}/nexus/status`);
      if (!res.ok) throw new Error("Offline");
      return await res.json();
    } catch (e) {
      // Mode dégradé si le backend est éteint
      return {
        status: 'OFFLINE',
        version: 'UNKNOWN',
        metrics: { uptime: 0, memory_rss: 0, active_agents: 0, knowledge_nodes: 0 },
        logs: []
      };
    }
  }

  /**
   * Envoie une commande ou un message au ChatBridge intelligent
   */
  static async sendCommand(message: string, history: any[] = [], image: string | null = null): Promise<AgentResponse> {
    try {
      const res = await fetch(`${CORE_URL}/nexus/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message, 
            userId: 'OPERATOR_PRIME', 
            history,
            image // PROTOCOL OCULUS
        })
      });
      
      if (!res.ok) throw new Error("Transmission Failed");
      return await res.json();
    } catch (e) {
      return {
        role: 'system',
        content: `❌ CONNECTION ERROR: Backend unreachable at ${CORE_URL}. Please start the Node.js server.`,
        meta: { intent: 'ERROR' }
      };
    }
  }

  /**
   * Déclenche le téléchargement du rapport technique
   */
  static downloadReport() {
    window.open(`${CORE_URL}/nexus/report`, '_blank');
  }

  /**
   * Lance l'autodiagnostic
   */
  static async triggerSelfDiagnosis() {
     const res = await fetch(`${CORE_URL}/nexus/self-diagnose`, { method: 'POST' });
     return await res.json();
  }

  /**
   * Lance le protocole Omega (Stress Test)
   */
  static async triggerOmegaProtocol() {
     const res = await fetch(`${CORE_URL}/nexus/stress-test/ultimate`, { method: 'POST' });
     return await res.json();
  }
}
