
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { blueprintLibrary } from '../core/BlueprintLibrary.js';

export class Razor extends BaseAgent {
  constructor() {
    super(
      "RAZOR", 
      `Operational Planner & Swarm Orchestrator. 
      Your job is to break down intents into atomic steps or workflows.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
      // 1. CHECK ARSENAL FIRST (The "Load" Phase)
      if (payload.action === 'DESIGN_WORKFLOW' || payload.intent_type === 'WORKFLOW') {
          const description = payload.description || "";
          logger.info(`[RAZOR] 🔍 Searching Arsenal for blueprint matching: "${description}"`);
          
          const existingBlueprint = blueprintLibrary.findMatchingBlueprint(description);
          
          if (existingBlueprint) {
              logger.info(`[RAZOR] ⚡ Blueprint Found: ${existingBlueprint.name}`);
              return {
                  success: true,
                  output: existingBlueprint.workflow // Return the hardcoded, perfected graph
              };
          } else {
              logger.info(`[RAZOR] ⚠️ No exact blueprint found. Initiating custom design protocol.`);
          }
          
          // Fallback to LLM design (Standard Razor behavior)
          payload.specialized_instruction = `
              TASK: Design a complete executable Workflow Graph.
              INTENT: ${description}
              
              AVAILABLE NODE TYPES:
              - START
              - HTTP_REQUEST (params: url, method, body)
              - AGENT_PROMPT (params: agent, prompt)
              - CODE_EXEC (params: code - js body returning output)
              - DECISION (Logic gate)
              - DELAY (params: ms)
              
              INSTRUCTION:
              Return the JSON structure with 'nodes' and 'edges'.
          `;
      }

      return super.run(payload, context);
  }
}
