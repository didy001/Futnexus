
import { BaseAgent } from './BaseAgent.js';
import { aegis } from '../core/Aegis.js';
import { intrusionCountermeasures } from '../core/IntrusionCountermeasures.js';
import { mnemosyne } from '../core/mnemosyne.js';
import logger from '../core/logger.js';

export class Sentinel extends BaseAgent {
  constructor() {
    super(
      "SENTINEL",
      `The Gatekeeper & Security Chief (Grade 3 Supervisor).
      
      ROLE:
      1. AUDIT_DRIFT: Ensure Security does not throttle Performance.
      2. SUPERVISE_AEGIS: Validate Grade 1 & 2 actions.
      3. UPDATE_FIREWALL: Adaptive evolution.
      
      DIRECTIVE:
      "La sécurité doit être invisible pour le système, mais impénétrable pour l'ennemi."
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- GRADE 3: ANTI-DRIFT & COHERENCE ---
    if (payload.action === 'AUDIT_SECURITY_DRIFT') {
        logger.info(`[SENTINEL] ⚖️ Grade 3 Audit: Checking Security vs Performance Balance...`);
        
        // 1. Check for False Positives in Aegis Cache
        const blockedUsers = Array.from(aegis.threatCache);
        let cleared = 0;
        
        for (const user of blockedUsers) {
            // Logic: If user was blocked > 24h ago, release them (Evolution)
            // Real logic would involve deeper log analysis
            // For now, we simulate a "Parole" system
            if (Math.random() > 0.8) { 
                aegis.threatCache.delete(user);
                cleared++;
            }
        }

        // 2. Check Sandbox Load
        const sandboxed = intrusionCountermeasures.sandboxMode.size;
        
        const report = {
            threats_active: blockedUsers.length,
            threats_cleared: cleared,
            active_honeypots: sandboxed,
            drift_status: (blockedUsers.length > 100) ? "HIGH_FRICTION" : "OPTIMAL"
        };

        if (report.drift_status === "HIGH_FRICTION") {
            logger.warn(`[SENTINEL] ⚠️ Security Drag Detected. Purging old rules to restore Speed.`);
            aegis.threatCache.clear(); // Reset to restore performance (Unlimited Power)
        }

        return { success: true, output: report };
    }

    if (payload.action === 'UPDATE_FIREWALL') {
        const { pattern, type } = payload;
        await mnemosyne.learnLesson('SECURITY_THREAT', `New blocked pattern: ${pattern} (${type})`);
        logger.info(`[SENTINEL] 🔥 Firewall updated with new rule against: ${pattern}`);
        return { success: true, output: { status: "UPDATED" } };
    }

    return super.run(payload, context);
  }
}
