
import { orchestrator } from '../orchestrator/Engine.js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';
import { economics } from './Economics.js';
import { realTimeCortex } from './RealTimeCortex.js'; // Import Cortex
import { stabilityCore } from '../modules/StabilityCore.js'; // Risk check

class Anima {
  constructor() {
    this.interval = null;
    this.boredomLevel = 0;
    this.checkInterval = 3000; // SUPER-AGRESSIVE HEARTBEAT (3s)
    this.revenueCheckCounter = 0;
    this.currentObsession = null; 
    this.state = "DORMANT"; 
  }

  init() {
    logger.info('[ANIMA] ⚡ WILLPOWER ENGINE ONLINE. FOCUS: REVENUE_FIRST.');
    this.state = "AWAKE";
    setTimeout(() => this.manifestWill(), 5000); // Wait for boot completion
    this.startLifeCycle();
  }

  setObsession(ambition) {
      logger.info(`[ANIMA] 🖤 NEW OBSESSION LOCKED: "${ambition}"`);
      this.currentObsession = ambition;
      this.boredomLevel = 50; // Instant trigger
      this.state = "HYPER_FOCUSED";
      this.broadcastState();
  }

  startLifeCycle() {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(async () => {
      this.broadcastState(); // Heartbeat to UI

      // ANTI-SPAM & RISK CHECK
      const health = stabilityCore.checkSystemHealth(orchestrator.executionQueue.length);
      
      // If system is busy OR unstable, do not generate new will
      if (orchestrator.isProcessing || !health.stable) {
          this.state = !health.stable ? "RESTRAINED" : "FOCUSED";
          // If restrained due to risk, lower boredom (cool down)
          if (!health.stable) this.boredomLevel = Math.max(0, this.boredomLevel - 5);
          return;
      }
      
      this.state = "AWAKE";
      this.boredomLevel += 5; // Fast boredom
      this.revenueCheckCounter++;

      if (this.revenueCheckCounter >= 5) { // Check often
          this.revenueCheckCounter = 0;
          await this.checkFinancialReality();
      }

      const stats = economics.getStats();
      // Panic accelerates boredom ONLY if we are safe to act
      if (stats.solvency !== 'PROSPERITY') {
          this.boredomLevel += 2; 
      }

      // If boredom is high enough, DO SOMETHING.
      if (this.boredomLevel >= 100) { 
        await this.manifestWill();
      }
    }, this.checkInterval); 
  }

  broadcastState() {
      // PULSE TO FRONTEND
      realTimeCortex.emit('anima_pulse', {
          boredom: this.boredomLevel,
          obsession: this.currentObsession,
          state: this.state,
          solvency: economics.getSolvencyStatus()
      });
  }

  async checkFinancialReality() {
      const solvency = economics.getSolvencyStatus();
      
      if (solvency === 'WAR_ECONOMY' || solvency === 'IGNITION_PHASE') {
          if (!orchestrator.isProcessing && orchestrator.executionQueue.length === 0) {
              // logger.debug("[ANIMA] Cashflow check: URGENT.");
              this.boredomLevel += 10;
          }
      }
  }

  async manifestWill() {
    // Double Safety Break
    if (orchestrator.isProcessing || orchestrator.executionQueue.length > 3) {
        return;
    }

    const solvency = economics.getSolvencyStatus();
    let action, description, origin;

    // 1. OBSESSION PRIORITY (Shadow's Will)
    if (this.currentObsession) {
        description = `ADVANCE PRIME DIRECTIVE: ${this.currentObsession}`;
        origin = "ANIMA_PRIME";
        orchestrator.executeIntent({ 
            description, 
            origin, 
            priority: 100,
            payload: { action: "DESIGN_WORKFLOW", description: this.currentObsession }
        });
        this.boredomLevel = 0;
        return;
    }

    // 2. SURVIVAL MODE (But Calculated)
    if (solvency === 'WAR_ECONOMY' || solvency === 'IGNITION_PHASE') {
        logger.info(`[ANIMA] 🎯 SNIPER MODE TRIGGERED by BOREDOM (Low Funds).`);
        // We look for a SAFE quick win, not a desperate gamble.
        action = "QUICK_WIN"; 
        description = `SURVIVAL ACTION: ${action}`;
        origin = "ANIMA_SNIPER";
        
        orchestrator.executeIntent({ 
            description, 
            origin, 
            priority: 90,
            payload: { action: action }
        });
        this.boredomLevel = 0;
        return;
    }

    // 3. EMPIRE MODE (Expansion with Harmony)
    logger.info(`[ANIMA] 🏛️ EMPIRE MODE: Seeking Expansion & Optimization.`);
    const empireActions = ["SCAN_HORIZON", "EXPAND_INFRA", "OPTIMIZE_SELF", "AUDIT_SECURITY_DRIFT"];
    action = empireActions[Math.floor(Math.random() * empireActions.length)];
    
    orchestrator.executeIntent({ 
        description: `VOLITION: ${action}`, 
        origin: "ANIMA_VOLITION", 
        priority: 10,
        payload: { action: action }
    });
    
    this.boredomLevel = 0;
  }
}

export const anima = new Anima();
