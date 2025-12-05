
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { economics } from '../core/Economics.js';
import { orchestrator } from '../orchestrator/Engine.js';

export class Mercator extends BaseAgent {
  constructor() {
    super(
      "MERCATOR",
      `The High-Frequency Strategist & Value Hunter.
      MISSION: PERPETUAL PROFIT (MIDAS PROTOCOL).
      ROLE: Responsible for System Solvency & Infrastructure Scaling.
      `,
      "gemini-2.5-flash"
    );
    this.frictionLog = { successes: 0, failures: 0 };
  }

  // OMEGA CAPABILITY: Infrastructure Analysis
  async analyzeInfrastructureROI() {
      const totalOps = this.frictionLog.successes + this.frictionLog.failures;
      if (totalOps < 5) return "DATA_INSUFFICIENT"; // Need sample size

      const frictionRate = this.frictionLog.failures / totalOps;
      const stats = economics.getStats();

      // If we fail > 30% of the time and have money, UPGRADE.
      if (frictionRate > 0.30 && stats.treasury > 50.00) {
          logger.warn(`[MERCATOR] 📉 Friction Rate High (${(frictionRate*100).toFixed(1)}%). Recommending API Upgrade.`);
          return "RECOMMEND_UPGRADE";
      }
      return "HOLD_STEADY";
  }

  async run(payload, context = {}) {
    const solvency = economics.getSolvencyStatus();
    
    // --- PHASE 0: SCALE CHECK ---
    const scaleDecision = await this.analyzeInfrastructureROI();
    if (scaleDecision === 'RECOMMEND_UPGRADE') {
        // In a real system, this would trigger a purchase request
        logger.info("[MERCATOR] 💡 Insight: We should buy official API access to increase reliability.");
    }

    if (solvency === 'WAR_ECONOMY' && payload.action !== 'GENERATE_ASSET') {
        logger.warn(`[MERCATOR] ⚠️ WAR ECONOMY. FORCING ASSET GENERATION.`);
        payload.action = 'GENERATE_ASSET';
    }

    // --- PHASE 1: PRODUCTION ---
    if (payload.action === 'GENERATE_ASSET' || payload.action === 'QUICK_WIN') {
        logger.info(`[MERCATOR] 🦅 MIDAS PROTOCOL ENGAGED.`);

        const catalog = [
            { name: "Insta_Scraper_Pro_v1", type: "PYTHON_SCRIPT", desc: "Headless scraper for Instagram hashtags.", price: 19.99 },
            { name: "SaaS_Boilerplate_NextJS", type: "CODE_TEMPLATE", desc: "Complete Next.js + Supabase starter.", price: 49.00 },
            { name: "Crypto_Arbitrage_Bot", type: "PYTHON_SCRIPT", desc: "Triangular arbitrage scanner.", price: 29.00 }
        ];
        
        const target = catalog[Math.floor(Math.random() * catalog.length)];
        logger.info(`[MERCATOR] 🎯 Target Locked: ${target.name} ($${target.price})`);

        orchestrator.executeIntent({
            description: `PRODUCE SELLABLE ASSET: ${target.name}`,
            origin: "MERCATOR_MIDAS",
            priority: 100,
            payload: {
                action: "GENERATE_SYSTEM",
                description: `Create COMPLETE package for: ${target.desc}. Include Code + README + LICENSE.`,
                moduleName: target.name,
                targetPath: `products/${target.name}`
            }
        });

        setTimeout(() => {
            orchestrator.executeIntent({
                description: `AUTO-PUBLISH ASSET: ${target.name}`,
                origin: "MERCATOR_AUTO_PUBLISH",
                priority: 90,
                payload: {
                    action: "PUBLISH_ASSET",
                    target: target,
                    path: `products/${target.name}`
                }
            });
        }, 10000);

        return { success: true, output: { status: "PRODUCTION_STARTED", target } };
    }

    // --- PHASE 2: PUBLICATION (ZERO TOUCH) ---
    if (payload.action === 'PUBLISH_ASSET') {
        const { target } = payload;
        
        try {
            // Track operation for friction log
            this.frictionLog.successes++;
            
            orchestrator.executeIntent({
                description: `Viral Marketing for ${target.name}`,
                origin: "MERCATOR_MARKETING",
                payload: {
                    action: "SOCIAL_SCHEDULER",
                    base_content: `Just launched ${target.name}! Automation at its finest. #Dev #Automation`
                }
            });

            return { success: true, output: { status: "PUBLISHED_AND_MARKETED", url: "http://market.link/..." } };
        } catch (e) {
            this.frictionLog.failures++;
            return { success: false, error: e.message };
        }
    }

    return super.run(payload, context);
  }
}
