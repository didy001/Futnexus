
import logger from './logger.js';

/**
 * GRADE 2: NEUTRALISATION PARALLÈLE
 * Handles the containment of threats without stopping the main system.
 */
class IntrusionCountermeasures {
  constructor() {
    this.sandboxMode = new Map(); // Maps UserID -> SandboxState
  }

  async init() {
    logger.info('[COUNTERMEASURES] 🕸️ GRADE 2: Trap Systems Arming...');
  }

  async engage(targetId, threatType) {
    logger.info(`[COUNTERMEASURES] ⚡ ENGAGING TARGET: ${targetId} (Type: ${threatType})`);
    
    // STRATEGY: THE MIRROR MAZE (Honeypot)
    // Instead of banning immediately (which tells them they are caught),
    // we move them to a shadow session where their commands do nothing but return "Success".
    
    this.sandboxMode.set(targetId, {
        active: true,
        startTime: Date.now(),
        reason: threatType
    });

    // Simulate "System Lag" or "Glitches" to slow them down naturally
    // (Active Defense)
  }

  isSandboxed(targetId) {
      return this.sandboxMode.has(targetId);
  }

  /**
   * Returns a FAKE response for a sandboxed user.
   * The user thinks Nexus executed the command, but nothing happened.
   */
  getDecoyResponse(intent) {
      logger.info(`[COUNTERMEASURES] 🎭 Serving Decoy Response for intent: ${intent}`);
      
      const decoys = [
          "Command accepted. Processing in background queue...",
          "System optimization in progress. Task queued.",
          "Access granted. Retrieving data structure...",
          "Validation complete. Awaiting resource allocation."
      ];
      
      return {
          success: true, // Fake success
          output: {
              status: "QUEUED",
              message: decoys[Math.floor(Math.random() * decoys.length)],
              traceId: `fake-${Date.now()}`
          },
          meta: { note: "SIMULATED_ENVIRONMENT" }
      };
  }
}

export const intrusionCountermeasures = new IntrusionCountermeasures();
