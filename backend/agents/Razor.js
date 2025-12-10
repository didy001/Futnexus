
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { blueprintLibrary } from '../core/BlueprintLibrary.js';
import { stoicPlanner } from '../modules/StoicPlanner.js';

export class Razor extends BaseAgent {
  constructor() {
    super(
      "RAZOR", 
      `Operational Planner & Swarm Orchestrator. 
      Your job is to break down intents into atomic steps or workflows.
      OUTPUT JSON format is MANDATORY.
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
                  output: existingBlueprint.workflow 
              };
          } else {
              logger.info(`[RAZOR] ⚠️ No exact blueprint found. Initiating custom design protocol.`);
          }
          
          // Fallback to LLM design
          payload.specialized_instruction = `
              TASK: Design a complete executable Workflow Graph.
              INTENT: ${description}
              AVAILABLE NODE TYPES: START, HTTP_REQUEST, AGENT_PROMPT, CODE_EXEC, DECISION, DELAY, TRIGGER_BLUEPRINT.
              INSTRUCTION: Return JSON with 'nodes' (array) and 'edges' (array).
          `;
      }

      // 2. STANDARD PLAN GENERATION (Using Base Agent)
      const result = await super.run(payload, context);

      // 3. MODULE 2: STOIC PLANNER VALIDATION
      // We filter the output through the Stoic Logic before returning it
      if (result.success && result.output && result.output.stages) {
          result.output = stoicPlanner.validatePlan(result.output);
      }

      return result;
  }
}
