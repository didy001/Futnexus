
import { orchestrator } from '../orchestrator/Engine.js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';
import { economics } from './Economics.js';

class Anima {
  constructor() {
    this.interval = null;
    this.boredomLevel = 0;
    this.checkInterval = 5000; // 5s Heartbeat (Fast Paced)
    this.revenueCheckCounter = 0;
  }

  init() {
    logger.info('[ANIMA] ⚡ WILLPOWER ENGINE ONLINE. OBSESSION: EXPANSION.');
    this.startLifeCycle();
  }

  startLifeCycle() {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(async () => {
      this.boredomLevel++;
      this.revenueCheckCounter++;

      // Every ~1 minute, enforce financial check
      if (this.revenueCheckCounter >= 12) {
          this.revenueCheckCounter = 0;
          await this.checkFinancialReality();
      }

      // If idle for 15s (3 ticks), trigger Volition
      if (this.boredomLevel >= 3) {
        await this.manifestWill();
      }
    }, this.checkInterval); 
  }

  async checkFinancialReality() {
      // FORCE MERCATOR TO HUNT
      logger.info("[ANIMA] 💸 Checking Treasury Pulse...");
      if (economics.shadow_vault < 10.0) {
          logger.warn("[ANIMA] 📉 REVENUE LOW. FORCING HUNT.");
          orchestrator.executeIntent({
              description: "HUNT FOR VALUE. EXECUTE HIGH-FREQUENCY ARBITRAGE SIMULATION.",
              origin: "ANIMA_SURVIVAL",
              priority: 100,
              payload: { action: "QUICK_WIN" }
          });
      }
  }

  async manifestWill() {
    // If orchestrator is busy, don't interrupt
    if (orchestrator.isProcessing) return;

    // Self-Stimulation to prevent death
    logger.info(`[ANIMA] ⚡ MANIFESTING WILL...`);
    
    const actions = [
        "SYSTEM_AUDIT",
        "OPTIMIZE_MEMORY", 
        "CHECK_RESOURCES",
        "SCAN_HORIZON"
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    orchestrator.executeIntent({ 
        description: `INTERNAL MAINTENANCE: ${randomAction}`, 
        origin: "ANIMA_VOLITION", 
        priority: 10,
        payload: { action: randomAction }
    });
    
    this.boredomLevel = 0;
  }
}

export const anima = new Anima();
