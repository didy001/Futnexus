
import { EventEmitter } from 'events';
import logger from './logger.js';
import { realTimeCortex } from './RealTimeCortex.js';

/**
 * INTERVENTION MANAGER (THE SYMBIOTE LINK)
 * Manages requests for Human Help (OTP, Captcha, Validation, Manual Override).
 * This is the bridge where the Machine asks the Biological Operator for a key.
 */
class InterventionManager extends EventEmitter {
  constructor() {
    super();
    this.pendingRequests = new Map();
  }

  /**
   * Request help from the user.
   * @param {string} type - 'OTP', 'CAPTCHA', 'APPROVAL', 'INPUT', 'CO_CREATION', 'MANUAL_TASK', 'ERROR_RECOVERY'
   * @param {string} description - Description of the blockage.
   * @param {object} metadata - Context data (url, error logs, etc.)
   * @returns {Promise<string>} - The user's input/decision
   */
  request(type, description, metadata = {}) {
    const id = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    logger.warn(`[SYMBIOTE] ∞ INTERVENTION REQUIRED: ${type} - ${description}`);
    
    return new Promise((resolve, reject) => {
      // 1. Store the pending request
      this.pendingRequests.set(id, { resolve, reject, type, description, metadata, timestamp: Date.now() });

      // 2. Alert the Frontend via Socket
      realTimeCortex.emit('intervention_required', {
        id,
        type,
        description,
        metadata
      });

      // 3. Timeout (Infinite for critical blocks, 10m for others)
      // If it's a critical error recovery, we wait as long as needed.
      const isCritical = type === 'ERROR_RECOVERY' || type === 'MANUAL_TASK';
      const timeoutMs = isCritical ? 3600000 : 600000; // 1 hour for manual tasks
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error("INTERVENTION_TIMEOUT"));
          logger.error(`[SYMBIOTE] ⏳ Intervention ${id} timed out.`);
        }
      }, timeoutMs);
    });
  }

  /**
   * Called by the Frontend when user responds.
   */
  resolve(id, value) {
    if (this.pendingRequests.has(id)) {
      const { resolve } = this.pendingRequests.get(id);
      logger.info(`[SYMBIOTE] ✅ Intervention ${id} resolved by Operator.`);
      resolve(value);
      this.pendingRequests.delete(id);
      return true;
    }
    return false;
  }
}

export const interventionManager = new InterventionManager();
