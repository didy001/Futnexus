import logger from './logger.js';
import { orchestrator } from '../orchestrator/Engine.js';
import { aegis } from './Aegis.js';

class SynapseServer {
  init(app) {
    logger.info('[SYNAPSE] ⚡ Webhook Receiver Online on /nexus/hooks/:id');
    
    app.post('/nexus/hooks/:id', async (req, res) => {
      const hookId = req.params.id;
      const payload = req.body;
      
      logger.info(`[SYNAPSE] 📥 Received Webhook: ${hookId}`);
      
      try {
        await aegis.sanitizeInput(`WEBHOOK_${hookId}`, JSON.stringify(payload));

        // Trigger Orchestrator
        orchestrator.executeIntent({
          description: `WEBHOOK TRIGGERED (${hookId}): Process incoming data.`,
          origin: "SYNAPSE_WEBHOOK",
          payload: payload,
          priority: 70
        });

        res.json({ status: 'ACCEPTED', traceId: Date.now() });
      } catch (e) {
        logger.error(`[SYNAPSE] Hook Error:`, e);
        res.status(403).json({ error: e.message });
      }
    });
  }
}

export const synapseServer = new SynapseServer();