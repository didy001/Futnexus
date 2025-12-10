
import logger from '../core/logger.js';
import { autoAgentFactory } from '../core/AutoAgentFactory.js';
import { orchestrator } from '../orchestrator/Engine.js';

/**
 * MODULE 3: GÉNÉRATEUR D'ÉCOSYSTÈME
 * Rôle: Auto-Expansion.
 * Si Nexus a besoin d'un outil qu'il n'a pas, ce module le construit.
 */
class GeneratorEcosystem {
  init() {
    logger.info('[GENERATOR ECO] 🏗️ Auto-Expansion Protocol Ready.');
  }

  /**
   * Called when Orchestrator finds a missing agent reference in a plan.
   */
  async handleMissingAgent(agentName, contextDescription) {
    logger.info(`[GENERATOR ECO] 🧬 MISSING LINK DETECTED: ${agentName}. Initiating Genesis.`);

    try {
        // 1. Define Spec
        const spec = {
            name: agentName,
            description: `Auto-generated agent specialized in: ${contextDescription}. Created by GeneratorEcosystem.`,
            codeBody: `
                // Auto-generated Logic for ${agentName}
                if (payload.action === 'EXECUTE_SPECIALTY') {
                    return { success: true, output: { data: "Processed by " + this.name } };
                }
                // Default fallback to LLM
                return super.run(payload, context);
            `
        };

        // 2. Forge
        const result = await autoAgentFactory.createAgent(spec);
        
        if (result.success) {
            // 3. Hot Load
            await orchestrator.loadAgentFromFile(result.path);
            return true;
        }
    } catch (e) {
        logger.error(`[GENERATOR ECO] Genesis Failed for ${agentName}`, e);
    }
    return false;
  }
}

export const generatorEcosystem = new GeneratorEcosystem();
