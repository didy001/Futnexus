
import logger from '../core/logger.js';
import { orchestrator } from '../orchestrator/Engine.js';

/**
 * MODULE 1: LE CŒUR ANTI-FAILLE
 * Rôle: Homéostasie du système.
 * Empêche le burn-out computationnel et la boucle infinie.
 */
class StabilityCore {
  constructor() {
    this.consecutiveFailures = 0;
    this.maxFailures = 5;
    this.lastStabilization = Date.now();
  }

  async init() {
    logger.info('[STABILITY CORE] 🟢 Stabilization Field Active.');
  }

  /**
   * Called by Orchestrator before processing ANY intent.
   * Returns TRUE if system is stable, FALSE if we must pause.
   */
  checkSystemHealth(queueLength) {
    // 1. COGNITIVE OVERLOAD CHECK
    if (queueLength > 50) {
        logger.warn(`[STABILITY] ⚠️ High Load (${queueLength} tasks). Throttling input.`);
        return { stable: false, action: 'THROTTLE' };
    }

    // 2. FAILURE CASCADE CHECK
    if (this.consecutiveFailures >= this.maxFailures) {
        logger.error(`[STABILITY] 🛑 FAILURE CASCADE DETECTED. EMERGENCY COOL-DOWN.`);
        this.consecutiveFailures = 0; // Reset to allow retry after pause
        return { stable: false, action: 'PAUSE', duration: 10000 };
    }

    return { stable: true };
  }

  reportSuccess() {
      if (this.consecutiveFailures > 0) this.consecutiveFailures--;
  }

  reportFailure() {
      this.consecutiveFailures++;
  }
}

export const stabilityCore = new StabilityCore();
