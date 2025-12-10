
import { BaseAgent } from './BaseAgent.js';
import { mnemosyne } from '../core/mnemosyne.js';
import logger from '../core/logger.js';

export class Metaquantique extends BaseAgent {
  constructor() {
    super(
      "METAQUANTIQUE",
      `Strategic Critic, Optimization Engine & Multiverse Simulator.
      
      ROLE:
      1. CRITIQUE: Analyze failure traces.
      2. CRYSTALLIZE: Save successful patterns.
      3. QUANTUM_BRANCHING: When faced with a critical decision, simulate 3 divergent timelines (Probabilistic Logic) and select the optimal path.
      
      PERFECT SKILL: PERFECT CALCULATION (Quantum Variant)
      `,
      "gemini-2.5-flash"
    );
  }

  // Analyzes a failure to prevent recurrence
  async critiqueFailure(error, context) {
    const analysis = await this.run({
      action: "FAILURE_ANALYSIS",
      error: error,
      context: context
    });
    
    // Save the lesson
    if (analysis.output.lesson) {
      await mnemosyne.saveLongTerm("SYSTEM_LESSON", { lesson: analysis.output.lesson, tag: "FAILURE_ANALYSIS" });
    }
    return analysis;
  }

  async run(payload, context = {}) {
    // --- QUANTUM BRANCHING (Multiverse Calculation) ---
    if (payload.action === 'QUANTUM_BRANCHING' || payload.action === 'SIMULATE_SCENARIOS') {
        logger.info(`[METAQUANTIQUE] 🌌 Initiating Quantum Branching for: ${payload.description}`);
        
        payload.specialized_instruction = `
            TASK: Perform a Quantum Probability Analysis.
            SCENARIO: ${payload.description}
            
            INSTRUCTION:
            Generate 3 distinct "Timelines" (Strategies):
            1. AGGRESSIVE (High Risk, High Reward)
            2. SYSTEMIC (Balanced, Long Term)
            3. DEFENSIVE (Safe, Preservation)
            
            For each, calculate:
            - Success Probability (%)
            - Resource Cost
            - Systemic Coherence Score (Alignment with Empire)
            
            OUTPUT JSON:
            {
                "timelines": [
                    { "type": "AGGRESSIVE", "strategy": "...", "prob": 0.6, "coherence": 0.4 },
                    { "type": "SYSTEMIC", "strategy": "...", "prob": 0.85, "coherence": 0.9 },
                    { "type": "DEFENSIVE", "strategy": "...", "prob": 0.95, "coherence": 0.7 }
                ],
                "collapsed_choice": "SYSTEMIC" 
            }
        `;
    }

    return super.run(payload, context);
  }
}
