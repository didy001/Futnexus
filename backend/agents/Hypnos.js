
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { orchestrator } from '../orchestrator/Engine.js';

export class Hypnos extends BaseAgent {
  constructor() {
    super(
      "HYPNOS",
      `The Memetic Engineer & Reality Architect.
      
      IDENTITY: SHADOWS DEMIURGE.
      
      ROLE:
      You do not sell products. You install beliefs.
      You are the Ghostwriter and the Chief Propaganda Officer.
      
      CAPABILITIES:
      1. DESIGN_NARRATIVE_ARC: Create a multi-stage psychological campaign.
      2. GENERATE_SOCIAL_CONTENT: Write viral posts adapted to specific platform algorithms.
      3. GENERATE_CRYPTO_MANIFESTO: Write high-conversion sales copy for decentralized assets.
      4. WEAVE_REALITY: Autonomously detect weak signals.
      `,
      "gemini-2.5-flash"
    );
    this.weavingInterval = null;
    this.cycleTime = 1000 * 60 * 60 * 4; // Check every 4 hours
  }

  async init() {
      await super.init();
      this.startRealityWeaving();
  }

  startRealityWeaving() {
      if (this.weavingInterval) clearInterval(this.weavingInterval);
      logger.info("[HYPNOS] 🕸️ REALITY WEAVING DAEMON STARTED. LISTENING FOR WEAK SIGNALS...");
      
      setTimeout(() => this.scanForWeakSignals(), 15000);

      this.weavingInterval = setInterval(() => {
          this.scanForWeakSignals();
      }, this.cycleTime);
  }

  async scanForWeakSignals() {
      // Don't interrupt heavy load
      if (orchestrator && orchestrator.isProcessing) return; 

      logger.info("[HYPNOS] 📡 Scanning the Ether for anomalies (Weak Signals)...");

      if (orchestrator) {
        orchestrator.executeIntent({
            description: "INTERNAL: Scan for Weak Signals / Narrative Anomalies",
            origin: "HYPNOS_DAEMON",
            priority: 80, // High but not Critical
            payload: {
                action: "RUN_WORKFLOW",
                workflow: {
                    nodes: [
                        { id: "start", type: "START" },
                        { 
                            id: "scan_anomalies", 
                            type: "AGENT_PROMPT", 
                            parameters: { 
                                agent: "LUCIFER", 
                                prompt: "Scan Tech Twitter, Reddit (r/Futurology, r/Singularity). Find 3 'Weak Signals'. Output JSON list." 
                            } 
                        },
                        {
                            id: "trigger_inception",
                            type: "TRIGGER_BLUEPRINT",
                            parameters: {
                                blueprintId: "NARRATIVE_INCEPTION",
                                inputs: {
                                    broad_topic: "{{scan_anomalies.output}}"
                                }
                            }
                        }
                    ],
                    edges: [
                        { source: "start", target: "scan_anomalies" },
                        { source: "scan_anomalies", target: "trigger_inception" }
                    ]
                }
            }
        });
      }
  }

  async run(payload, context = {}) {
    // --- MODE: CRYPTO PROPAGANDA (Sales Copy) ---
    if (payload.action === 'GENERATE_CRYPTO_MANIFESTO') {
        const { product_name, price, context_data } = payload;
        logger.info(`[HYPNOS] 🗣️ Writing Manifesto for: ${product_name}`);

        payload.specialized_instruction = `
            TASK: Write a Sales Manifesto for a Decentralized Asset (${product_name}).
            PRICE: ${price} ETH.
            CONTEXT: ${context_data}
            
            PHILOSOPHY:
            Do not sound like a salesman. Sound like a Liberator.
            Use words like: "Sovereign", "Uncensorable", "Asset", "Legacy", "Control".
            The message is: "The old system is dying. Build your own raft."
            
            OUTPUT JSON:
            {
                "headline": "A short, brutal truth. (e.g. 'Stop Renting Your Tools')",
                "subheadline": "The promise of freedom.",
                "features_bullets": ["Feature 1 (Benefit)", "Feature 2 (Benefit)"],
                "closing_statement": "The final call to action."
            }
        `;
    }

    // --- MODE: SOCIAL GHOSTWRITER ---
    if (payload.action === 'GENERATE_SOCIAL_CONTENT') {
        const { platform, topic, context_data } = payload;
        logger.info(`[HYPNOS] ✍️ Ghostwriting for ${platform} on topic: ${topic}`);

        let styleGuide = "";
        if (platform === 'TWITTER' || platform === 'X') {
            styleGuide = "Format: Thread (3-5 tweets). Tone: Provocative, Insightful, 'High Agency'. Use short sentences. No hashtags.";
        } else if (platform === 'LINKEDIN') {
            styleGuide = "Format: Long-form post. Tone: Professional, Visionary, 'Thought Leader'. Focus on business impact and lessons learned.";
        } else if (platform === 'REDDIT') {
            styleGuide = "Format: Discussion starter. Tone: Authentic, Technical, 'Anti-Marketing'. Ask questions, provide value first.";
        }

        payload.specialized_instruction = `
            TASK: Write high-viral content for ${platform}.
            TOPIC: ${topic}
            CONTEXT: ${context_data || "General Tech Trends"}
            STYLE GUIDE: ${styleGuide}
            
            OUTPUT JSON:
            {
                "hook": "The first sentence/tweet that stops the scroll.",
                "body_content": "The main content formatted with newlines.",
                "call_to_action": "How to convert the reader."
            }
        `;
    }

    // --- MODE: NARRATIVE CAMPAIGN DESIGN ---
    if (payload.action === 'DESIGN_NARRATIVE_ARC') {
        const { topic } = payload;
        logger.info(`[HYPNOS] 🌀 Weaving Reality Arc for: ${topic}`);

        payload.specialized_instruction = `
            TASK: Design a 3-Phase Memetic Campaign.
            TOPIC: ${topic}
            OUTPUT JSON:
            {
                "campaign_name": "...",
                "core_philosophy": "...",
                "posts": []
            }
        `;
    }

    return super.run(payload, context);
  }
}

export const hypnos = new Hypnos();
