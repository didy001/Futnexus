import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';
import { aegis } from './Aegis.js';
import { mimic } from './Mimic.js';
import { synapseServer } from './SynapseServer.js';

class ConnectorHub {
  constructor() {
    this.adapters = new Map();
    this.connectorsPath = path.resolve('./connectors');
  }

  async init() {
    logger.info('[CONNECTOR HUB] 🔌 Initializing Omni-Adapters...');
    
    // Ensure directory exists
    try {
        await fs.mkdir(this.connectorsPath, { recursive: true });
    } catch (e) {}

    // Dynamic import simulation for extensibility
    try {
      const { HttpAdapter } = await import('../connectors/HttpAdapter.js');
      this.registerAdapter('HTTP', new HttpAdapter());
    } catch (e) {}
    
    // Register AI Adapter if available
    try {
        const { AiAdapter } = await import('../connectors/AiAdapter.js');
        this.registerAdapter('AI', new AiAdapter());
    } catch(e) { /* ignore if not present yet */ }
    
    logger.info(`[CONNECTOR HUB] Registered ${this.adapters.size} active protocols.`);
  }

  registerAdapter(protocol, instance) {
    this.adapters.set(protocol.toUpperCase(), instance);
    logger.info(`[CONNECTOR HUB] + Protocol Mounted: ${protocol.toUpperCase()}`);
  }

  /**
   * THE UNIVERSAL INTERFACE
   * Abstracts away the complexity of "How do I connect?".
   * Automatically routes to API, Browser (Mimic), or Webhook (Synapse).
   * 
   * @param {Object} intentPacket - { target, action, description, type: 'INBOUND'|'OUTBOUND' }
   */
  async universalConnect(intentPacket) {
    const { target, action, type = 'OUTBOUND' } = intentPacket;
    logger.info(`[CONNECTOR HUB] 🌐 Universal Connect: ${action} on ${target}`);

    try {
        // 1. SECURITY GUARD (Anti-Drift / Anti-Intrusion)
        await aegis.governOutput('CONNECTOR_HUB', action, { target });

        // 2. PROTOCOL RESOLUTION
        // CASE A: INBOUND SYNC (Create a Webhook listener)
        if (type === 'INBOUND' || action.includes('LISTEN') || action.includes('WAIT_FOR')) {
            const hookId = target.replace(/[^a-z0-9]/gi, '_');
            // We assume Synapse is already running, we just return the endpoint 
            // capable of receiving the data.
            return {
                success: true,
                mode: 'SYNAPSE_WEBHOOK',
                endpoint: `/nexus/hooks/${hookId}`,
                instruction: "Configure external tool (n8n, Stripe, GitHub) to POST to this URL."
            };
        }

        // CASE B: ACTIVE BROWSER INTERACTION (Mimic)
        // Used when API is too complex or unavailable
        if (action.includes('BROWSE') || action.includes('CLICK') || action.includes('LOGIN')) {
             return await mimic.act(target, action);
        }

        // CASE C: STANDARD API (HttpAdapter)
        // Used for standard JSON/REST integrations
        const adapter = this.adapters.get('HTTP');
        const config = {
            url: target,
            method: action.includes('POST') || action.includes('SEND') ? 'POST' : 'GET',
            body: intentPacket.data
        };
        
        const result = await adapter.send(config);
        return { success: true, mode: 'API', data: result };

    } catch (error) {
        logger.error(`[CONNECTOR HUB] Universal Connection Failed:`, error);
        return { success: false, error: error.message };
    }
  }

  /**
   * Legacy method for direct adapter usage
   */
  async executeRequest(config) {
    const protocol = config.protocol?.toUpperCase() || 'HTTP';
    const adapter = this.adapters.get(protocol);

    if (!adapter) {
      throw new Error(`[CONNECTOR HUB] No adapter found for protocol: ${protocol}`);
    }

    logger.info(`[CONNECTOR HUB] 📡 Transmission >> [${protocol}] ${config.target || 'External System'}`);
    
    try {
      const result = await adapter.send(config);
      return { success: true, data: result };
    } catch (error) {
      logger.error(`[CONNECTOR HUB] Transmission Failed:`, error);
      return { success: false, error: error.message };
    }
  }
}

export const connectorHub = new ConnectorHub();