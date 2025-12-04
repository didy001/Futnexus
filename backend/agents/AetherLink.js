import { BaseAgent } from './BaseAgent.js';
import { connectorHub } from '../core/ConnectorHub.js';
import logger from '../core/logger.js';

export class AetherLink extends BaseAgent {
  constructor() {
    super(
      "AETHER_LINK",
      `The Diplomat & Universal Interface.
      
      ROLE:
      Manage all communication with EXTERNAL systems using the Universal Connection Protocol.
      
      CAPABILITIES:
      1. CONNECT_UNIVERSAL: Automatically determines if an API, Browser, or Webhook is needed.
      2. ROUTE_AI: Talk to external AIs (Claude, GPT).
      
      INSTRUCTIONS:
      - If user wants to "Watch" or "Listen" -> Use type: 'INBOUND'.
      - If user wants to "Post", "Get", "Click" -> Use type: 'OUTBOUND'.
      - If user wants to "Ask Claude" -> Use routing for AI.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    logger.info(`[AETHER LINK] 📡 Assessing Uplink Strategy for: ${payload.description}`);

    // AI Routing (Explicit Request)
    if (payload.action === 'ROUTE_AI' || (payload.description && payload.description.includes("Ask "))) {
        // Here we could directly call AiAdapter via Hub if registered, but usually we let universalConnect decide or define specific intent
        // For simplicity, we let the strategy check below handle it via Hub config
    }
    
    // Universal Connection Strategy
    // We let the LLM parse the payload into a structured intent for the ConnectorHub
    const strategyCheck = await super.run({
        ...payload,
        specialized_prompt: `
        Analyze this request: "${payload.description}"
        Determine the connection parameters.
        
        OUTPUT JSON:
        {
           "target": "URL or Service Name",
           "action": "GET / POST / CLICK / LISTEN / LOGIN",
           "type": "INBOUND" (if we wait for data) or "OUTBOUND" (if we fetch/act),
           "data": { ...any payload data... }
        }
        `
    }, context);
    
    if (strategyCheck.success && strategyCheck.output) {
        const connParams = strategyCheck.output;
        
        // Execute via Universal Hub
        const result = await connectorHub.universalConnect({
            target: connParams.target,
            action: connParams.action,
            type: connParams.type,
            data: connParams.data || payload.data
        });

        return { success: result.success, output: result };
    }

    // Fallback
    return strategyCheck;
  }
}