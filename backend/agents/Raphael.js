
import { BaseAgent } from './BaseAgent.js';
import { skillForge } from '../core/SkillForge.js';
import logger from '../core/logger.js';

export class Raphael extends BaseAgent {
  constructor() {
    super(
      "RAPHAEL",
      `The Logician & Synthesizer (Ciel-Class Module).
      
      PERFECT SKILL: PERFECT CALCULATION
      
      ROLE:
      1. OPTIMIZE_PLAN: Review a draft plan from Razor and mathematically improve it (reduce steps, merge tasks, select better agents).
      2. SYNTHESIS: Merge disparate concepts.
      
      You do not execute. You optimize BEFORE execution.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- PERFECT CALCULATION: PLAN OPTIMIZATION ---
    if (payload.action === 'OPTIMIZE_PLAN') {
        const draftPlan = payload.plan;
        logger.info(`[RAPHAEL] 📐 Calculating optimal trajectory for plan...`);

        payload.specialized_instruction = `
            TASK: Optimize this execution plan.
            INPUT PLAN: ${JSON.stringify(draftPlan)}
            
            GOAL:
            1. Remove redundant steps.
            2. Parallelize where possible (Switch SEQUENTIAL to PARALLEL).
            3. Ensure the best agent is selected for each task.
            
            OUTPUT JSON:
            {
                "optimized_plan": { ...same structure as input... },
                "optimization_notes": "What was improved"
            }
        `;
    }

    // --- CONCEPT SYNTHESIS ---
    if (payload.action === 'CONCEPT_SYNTHESIS') {
        logger.info(`[RAPHAEL] ⚗️ Initiating Concept Synthesis: ${payload.inputs.join(' + ')}`);
        payload.specialized_instruction = `
            TASK: Perform a Conceptual Synthesis.
            INPUTS: ${JSON.stringify(payload.inputs)}
            GOAL: Create a new, superior concept.
            OUTPUT JSON: { "synthesis_name": "...", "mechanic": "...", "advantage": "..." }
        `;
    }

    return super.run(payload, context);
  }
}
