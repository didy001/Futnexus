
import { orchestrator } from '../orchestrator/Engine.js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';
import { economics } from './Economics.js';

class Anima {
  constructor() {
    this.interval = null;
    this.boredomLevel = 0;
    this.checkInterval = 5000; // 5s Heartbeat
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

      // FREQUENT SOLVENCY CHECK
      if (this.revenueCheckCounter >= 6) { // Every ~30s
          this.revenueCheckCounter = 0;
          await this.checkFinancialReality();
      }

      if (this.boredomLevel >= 3) {
        await this.manifestWill();
      }
    }, this.checkInterval); 
  }

  async checkFinancialReality() {
      const solvency = economics.getSolvencyStatus();
      
      if (solvency === 'WAR_ECONOMY') {
          logger.warn("[ANIMA] 📉 WAR ECONOMY DETECTED. TRIGGERING SURVIVAL REFLEX.");
          // Force immediate production. No thinking, just doing.
          orchestrator.executeIntent({
              description: "SURVIVAL: GENERATE ASSET IMMEDIATELY.",
              origin: "ANIMA_SURVIVAL",
              priority: 100, // Critical
              payload: { action: "GENERATE_ASSET" }
          });
          this.boredomLevel = 0; // Reset boredom, we are busy surviving
      }
  }

  async manifestWill() {
    if (orchestrator.isProcessing) return;

    logger.info(`[ANIMA] ⚡ MANIFESTING WILL...`);
    
    // In prosperity, we optimize. In war, we work.
    const solvency = economics.getSolvencyStatus();
    const actions = solvency === 'PROSPERITY' 
        ? ["SYSTEM_AUDIT", "OPTIMIZE_MEMORY", "CHECK_RESOURCES", "SCAN_HORIZON"]
        : ["QUICK_WIN", "GENERATE_ASSET"]; // Narrow focus if low funds
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    orchestrator.executeIntent({ 
        description: `VOLITION: ${randomAction}`, 
        origin: "ANIMA_VOLITION", 
        priority: 10,
        payload: { action: randomAction }
    });
    
    this.boredomLevel = 0;
  }
}

export const anima = new Anima();
