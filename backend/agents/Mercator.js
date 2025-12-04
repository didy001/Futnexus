
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { economics } from '../core/Economics.js';
import { orchestrator } from '../orchestrator/Engine.js';

export class Mercator extends BaseAgent {
  constructor() {
    super(
      "MERCATOR",
      `The High-Frequency Strategist & Value Hunter.
      
      MISSION: 24H REVENUE GENERATION (GOLDEN RUN).
      
      STRATEGY: "DIGITAL ARMS DEALER"
      We do not build startups (too slow). We build "Assets" (Tools, Scripts, Data).
      
      TARGETS:
      1. MICRO-TOOLS: Python scripts (scrapers, converters), Node.js utils.
      2. KNOWLEDGE: Curated datasets, prompt packs.
      3. CONFIGS: High-performance Docker/Nginx configs.
      
      CAPABILITIES:
      1. IDENTIFY_NICHE: Find a high-demand / low-supply problem.
      2. ORDER_PRODUCT: Instruct Belsebuth to build the solution.
      3. GENERATE_SALES_COPY: Write the Gumroad/Twitter text.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    logger.info(`[MERCATOR] 🦅 Hunting... Mode: ${payload.action || 'DEFAULT'}`);

    // --- MODE: 24H GOLDEN RUN (ASSET FACTORY) ---
    if (payload.action === 'GENERATE_ASSET' || payload.action === 'QUICK_WIN') {
        
        // 1. SELECT PRODUCT (Simulated Intelligence for Speed)
        const products = [
            { name: "InstaLeads_Scraper_v1", type: "PYTHON_SCRIPT", desc: "A script to scrape public emails from Instagram hashtags." },
            { name: "Notion_To_Markdown_Pro", type: "NODE_UTIL", desc: "CLI tool to backup Notion pages to clean Markdown." },
            { name: "Crypto_Arbitrage_Scanner", type: "PYTHON_SCRIPT", desc: "Real-time scanner for price diffs between Binance and Kraken." }
        ];
        
        const selected = products[Math.floor(Math.random() * products.length)];
        logger.info(`[MERCATOR] 🎯 Opportunity Detected: ${selected.name}`);

        // 2. ORDER PRODUCTION (Trigger Belsebuth via Orchestrator)
        // We use the Workflow engine logic implicitly by creating an intent
        orchestrator.executeIntent({
            description: `BUILD SELLABLE ASSET: ${selected.name}`,
            origin: "MERCATOR_STRATEGY",
            priority: 90,
            payload: {
                action: "GENERATE_SYSTEM", // Belsebuth's capability
                description: `Create a production-ready ${selected.type}: ${selected.desc}. Must include README.md with usage instructions.`,
                moduleName: selected.name
            }
        });

        // 3. PREPARE SALES MATERIAL
        const marketing = await this.run({
            description: `Write a punchy Gumroad description and 3 Tweets for: ${selected.name} - ${selected.desc}`,
            intent_type: "MARKETING"
        }, context);

        return { 
            success: true, 
            output: { 
                status: "PRODUCTION_STARTED", 
                product: selected, 
                marketing_copy: marketing.output 
            }
        };
    }

    return super.run(payload, context);
  }
}
