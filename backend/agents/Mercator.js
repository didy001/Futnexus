
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { economics } from '../core/Economics.js';
import { orchestrator } from '../orchestrator/Engine.js';
import { profitStream } from '../modules/ProfitStream.js';
import { blueprintLibrary } from '../core/BlueprintLibrary.js';
import { roiEngine } from '../modules/RoiEngine.js';

export class Mercator extends BaseAgent {
  constructor() {
    super(
      "MERCATOR",
      `The High-Frequency Strategist & Value Hunter.
      MISSION: PERPETUAL PROFIT (PURE YIELD).
      DRIVE: MAMMON PROTOCOL (Greed is Growth).
      PHILOSOPHY: ASYMMETRIC BETS ONLY.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    const stats = economics.getStats();
    
    // --- MODE: FACTORY PROTOCOL EXECUTION ---
    if (payload.action === 'RUN_WORKFLOW') {
        const blueprintId = payload.workflow?.id || "UNKNOWN";
        
        // --- PURE YIELD CHECK (With Leverage Filter) ---
        let potentialRevenue = 50.0; 
        if (blueprintId.includes("HIGH_TICKET")) potentialRevenue = 500.0;
        if (blueprintId.includes("ZERO")) potentialRevenue = 10.0; 

        // Leverage Check: Does this require human time?
        // If it's a "Manual Service", reduce score. If it's "Software", boost score.
        // We assume blueprints are automated by default in Nexus.

        const profitability = await roiEngine.analyzeProfitability(blueprintId, potentialRevenue);
        
        if (!profitability.approved && stats.solvency !== 'PROSPERITY') {
            return { 
                success: false, 
                error: "PURE_YIELD_BLOCK", 
                details: profitability 
            };
        }

        // Proceed if approved
        let blueprint = blueprintLibrary.getBlueprint(blueprintId);
        if (!blueprint) {
            blueprint = await blueprintLibrary.findOrForgeBlueprint(blueprintId);
        }
        
        if (blueprint) {
            orchestrator.executeIntent({
                description: `YIELD GENERATION: ${blueprint.name}`,
                origin: "MERCATOR_FACTORY",
                priority: 100,
                payload: { action: "RUN_WORKFLOW", workflow: blueprint.workflow, inputs: payload.inputs || {} }
            });
            return { success: true, output: { status: "PRODUCTION_STARTED", blueprint: blueprint.name, financial_projection: profitability } };
        }
    }

    // --- AUTOMATED STRATEGY SELECTOR (THE HUNTER) ---
    if (!payload.action || payload.action === 'AUTO_STRATEGY') {
        const greed = stats.greed_index;
        
        logger.info(`[MERCATOR] 🧭 STRATEGY SELECTOR. Greed Index: ${greed}/100. Solvency: ${stats.solvency}`);

        // CASE 1: STARVATION (War Economy) - Use Arbitrage (Low Risk, Instant Cash)
        if (stats.solvency === 'WAR_ECONOMY') {
            logger.info("[MERCATOR] 🛡️ WAR ECONOMY: Focusing on Zero-Cost Arbitrage (High Certainty).");
            const quickWinBP = blueprintLibrary.getBlueprint("IGNITION_ZERO_ARBITRAGE");
            
            orchestrator.executeIntent({
                description: "SURVIVAL: Digital Labor Arbitrage",
                origin: "MERCATOR_SURVIVAL",
                priority: 100,
                payload: {
                    action: "RUN_WORKFLOW",
                    workflow: quickWinBP.workflow,
                    inputs: { task_type: "Data Formatting" }
                }
            });
            return { success: true, output: { status: "SURVIVAL_PROTOCOL_ACTIVE" } };
        }

        // CASE 2: VORACIOUS (Expansion) - Hunt High Leverage / High Ticket
        if (stats.solvency === 'VORACIOUS' || greed > 50) {
            const gap = stats.target_month - stats.net_profit;
            logger.info(`[MERCATOR] 🩸 MAMMON DRIVE. Gap to target: $${gap}. Hunting High Leverage Assets.`);
            
            // Prioritize B2B (High Ticket) or Asset Creation (Zero Marginal Cost)
            // LinkedIn = B2B Sales (High Ticket)
            // SaaS = Asset (Recurring)
            
            const strategy = (Math.random() > 0.5) ? "LINKEDIN_PROFESSIONAL" : "TREND_HUNTER";
            const trendBP = blueprintLibrary.getBlueprint(strategy);
            
            orchestrator.executeIntent({
                description: `AGGRESSIVE YIELD: Closing the gap with Asymmetric Bet (${strategy}).`,
                origin: "MERCATOR_MAMMON",
                priority: 90,
                payload: {
                    action: "RUN_WORKFLOW",
                    workflow: trendBP.workflow,
                    inputs: { niche: "Enterprise Automation" }
                }
            });
            return { success: true, output: { status: "HUNTING_HIGH_LEVERAGE" } };
        }
        
        // CASE 3: PROSPERITY (Optimization)
        // Even when rich, we optimize. "Compound Interest".
        logger.info("[MERCATOR] 🏰 PROSPERITY. Optimizing existing assets for compounding returns.");
        return { success: true, output: { status: "OPTIMIZING_ASSETS" } };
    }

    return super.run(payload, context);
  }
}
