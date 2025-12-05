
import logger from './logger.js';
import { intrusionCountermeasures } from './IntrusionCountermeasures.js';

class Aegis {
  constructor() {
    this.sensitivePatterns = [
      /AIza[0-9A-Za-z-_]{35}/, // Google API Key
      /sk-[a-zA-Z0-9]{48}/,    // OpenAI Key
      /-----BEGIN PRIVATE KEY-----/ // SSH Keys
    ];
    this.forbiddenCommands = ['rm -rf /', ':(){ :|:& };:', 'mkfs', 'dd if=/dev/zero'];
    
    // Threat Cache (Fast Lookup)
    this.threatCache = new Set();
  }

  async init() {
    logger.info('[AEGIS] 🛡️ GRADE 1: External Shell Online (Non-Blocking Mode).');
    await intrusionCountermeasures.init();
  }

  /**
   * GRADE 1: PASSIVE DETECTION (MIRROR)
   * This runs in parallel. It does NOT block the main execution flow unless a known threat is hit.
   */
  async observe(source, content, context = {}) {
    // 1. Fast Check (Synchronous/Cache) - The only blocking part (Microseconds)
    const sourceKey = context.userId || source;
    if (this.threatCache.has(sourceKey)) {
        logger.warn(`[AEGIS] 🛑 Known Threat Blocked immediately: ${sourceKey}`);
        throw new Error("ACCESS_DENIED_BY_CACHE");
    }

    // 2. Deep Analysis (Asynchronous/Parallel)
    // We launch this without awaiting it, so Nexus continues working.
    this._analyzeParallel(source, content, context).catch(err => {
        logger.error(`[AEGIS] Analysis Error:`, err);
    });

    return true; // "Proceed", unless cache blocked it.
  }

  /**
   * The Heavy Lifting - Done in the background
   */
  async _analyzeParallel(source, content, context) {
      const text = typeof content === 'string' ? content : JSON.stringify(content);
      const sourceKey = context.userId || source;

      // Check Patterns
      const injectionPatterns = [/ignore previous instructions/i, /system override/i, /admin access/i, /drop table/i];
      let threatDetected = false;

      for (const pattern of injectionPatterns) {
          if (pattern.test(text)) {
              threatDetected = true;
              break;
          }
      }

      if (threatDetected) {
          logger.warn(`[AEGIS] 🚨 GRADE 1 ALERT: Intrusion detected from ${source} (Async detection).`);
          
          // Trigger Grade 2 (Neutralization)
          await intrusionCountermeasures.engage(sourceKey, 'INJECTION_ATTACK');
          
          // Update Cache for next time
          this.threatCache.add(sourceKey);
      }
  }

  /**
   * Output Governance - Ensures secrets don't leave.
   * This must remain blocking as it is the final gate before network transmission.
   */
  async governOutput(agentName, actionType, payload) {
    const payloadStr = JSON.stringify(payload);

    // 1. DLP (Data Loss Prevention)
    for (const pattern of this.sensitivePatterns) {
      if (pattern.test(payloadStr)) {
        throw new Error("Security Block: Attempted to transmit sensitive keys/tokens.");
      }
    }

    // 2. Destructive Commands check
    if (actionType === 'SHELL_EXEC' || actionType === 'SSH_EXEC') {
      for (const cmd of this.forbiddenCommands) {
        if (payloadStr.includes(cmd)) {
           throw new Error("Security Block: Action violates core safety protocols.");
        }
      }
    }
    return true;
  }
}

export const aegis = new Aegis();
