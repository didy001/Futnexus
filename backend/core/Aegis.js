
import logger from './logger.js';

class Aegis {
  constructor() {
    this.sensitivePatterns = [
      /AIza[0-9A-Za-z-_]{35}/, // Google API Key
      /sk-[a-zA-Z0-9]{48}/,    // OpenAI Key
      /-----BEGIN PRIVATE KEY-----/ // SSH Keys
    ];
    this.forbiddenCommands = ['rm -rf /', ':(){ :|:& };:', 'mkfs', 'dd if=/dev/zero'];
  }

  async init() {
    logger.info('[AEGIS] 🛡️ Neural Firewall Online.');
  }

  async sanitizeInput(source, content) {
    if (!content) return content;
    const text = typeof content === 'string' ? content : JSON.stringify(content);

    const injectionPatterns = [/ignore previous instructions/i, /system override/i, /admin access/i];
    for (const pattern of injectionPatterns) {
      if (pattern.test(text)) {
        logger.warn(`[AEGIS] 🚨 INTRUSION DETECTED from ${source}. Pattern: ${pattern}`);
        throw new Error(`Security Block: Malicious input pattern detected.`);
      }
    }
    return content;
  }

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
