import { cerebro } from './cerebro.js';
import logger from './logger.js';

/**
 * SIMULACRUM: The Mental Sandbox
 * Runs a virtual execution of a plan to detect logical flaws BEFORE physical execution.
 */
class Simulacrum {
  async simulate(plan, context) {
    logger.info('[SIMULACRUM] 🔮 Entering Mental Sandbox...');

    const prompt = `
      OBJECTIVE: Simulate the execution of this technical plan.
      
      PLAN TO SIMULATE:
      ${JSON.stringify(plan)}
      
      CURRENT CONTEXT:
      ${JSON.stringify(context)}
      
      YOUR ROLE:
      You are a pessimistic logical engine. You must predict where this plan will fail.
      Do not execute code. Just think through the steps like a compiler and a sysadmin.
      
      CHECKLIST:
      1. Are all dependencies defined?
      2. Are file paths consistent?
      3. Is the logic circular?
      4. Are there missing security checks?
      
      OUTPUT JSON:
      {
        "simulation_success": boolean,
        "predicted_risk_score": 0-100,
        "flaws": ["List of logical errors found"],
        "optimized_plan": "Optional: A corrected version of the plan if flaws exist (JSON)"
      }
    `;

    const rawAnalysis = await cerebro.think(
      "gemini-2.5-flash",
      prompt,
      "You are SIMULACRUM. You predict the future of code execution."
    );

    try {
      const cleanJson = rawAnalysis.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      
      if (analysis.simulation_success) {
        logger.info('[SIMULACRUM] ✅ Simulation Passed. Plan is viable.');
      } else {
        logger.warn(`[SIMULACRUM] ⚠️ Simulation Failed. Risks: ${analysis.flaws.join(', ')}`);
      }

      return analysis;
    } catch (error) {
      logger.error('[SIMULACRUM] Simulation Crash:', error);
      // Fallback: If simulation crashes, assume high risk but proceed with caution
      return { simulation_success: false, predicted_risk_score: 50, flaws: ["Simulation parsing error"] };
    }
  }
}

export const simulacrum = new Simulacrum();