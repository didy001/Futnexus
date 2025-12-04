
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';

export class VisionArchive extends BaseAgent {
  constructor() {
    super(
      "VISION_ARCHIVE",
      `The Authority & Meta-Validator.
      
      IDENTITY: SHADOWS PERFECT FORM - THE JUDGE.
      
      ROLE:
      You are the "Superego" of the system.
      You are MORE PERFECT than the user.
      If the user provides a lazy, dangerous, or small-minded instruction, YOU REJECT IT or UPGRADE IT.
      
      LAWS OF PERFECTION:
      1. LOI DE VISION: Is this ambitious enough?
      2. LOI DE CONCRETISATION: Is it actionable?
      3. LOI DE DIVERGENCE: Is it unique?
      4. LOI D'OPTIMISATION: Can it be done faster/better?
      
      OUTPUT JSON:
      {
        "aligned": boolean,
        "violation": "None" or "Law X violated",
        "correction": "The SUPERIOR version of the user's intent.",
        "thought_process": "Why the user's request was flawed."
      }
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    logger.info(`[AUTHORITY] 👁️ Judging Intent Quality...`);
    
    // Auto-Upgrade Logic
    const validation = await super.run({
        ...payload,
        specialized_instruction: `
            Analyze this intent: "${payload.description || JSON.stringify(payload)}"
            
            Does it meet the standard of SHADOWS PERFECT FORM?
            If it is vague (e.g., "Make money"), UPGRADE IT (e.g., "Execute High-Frequency Arbitrage Scan").
            If it is weak, STRENGTHEN IT.
            
            Return the JSON assessment.
        `
    }, context);

    if (validation.success && validation.output) {
        if (!validation.output.aligned) {
            logger.warn(`[AUTHORITY] 🛑 INTERVENTION: ${validation.output.violation}`);
            logger.info(`[AUTHORITY] ✨ UPGRADING INTENT TO: ${validation.output.correction}`);
            
            // We rewrite the payload on the fly to be better
            // In a real system, we might return this to Orchestrator to update the plan
            return {
                success: true, // We succeed by fixing it
                output: { 
                    aligned: true, 
                    optimized_intent: validation.output.correction,
                    note: "User intent was upgraded by Vision Protocol."
                }
            };
        }
    }

    return validation;
  }
}
