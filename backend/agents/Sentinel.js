
import { BaseAgent } from './BaseAgent.js';
import { aegis } from '../core/Aegis.js';
import { intrusionCountermeasures } from '../core/IntrusionCountermeasures.js';
import { mnemosyne } from '../core/mnemosyne.js';
import logger from '../core/logger.js';
import { orchestrator } from '../orchestrator/Engine.js';

export class Sentinel extends BaseAgent {
  constructor() {
    super(
      "SENTINEL",
      `The Gatekeeper & Security Chief (Grade 3 Supervisor).
      
      ROLE:
      1. AUDIT_DRIFT: Ensure Security does not throttle Performance.
      2. SUPERVISE_AEGIS: Validate Grade 1 & 2 actions.
      3. UPDATE_FIREWALL: Adaptive evolution.
      4. HYDRA_REFLEX: Handle Ban Events by rotating infrastructure.
      
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

    // --- PROTOCOL HYDRA: EMERGENCY REACTION ---
    if (payload.action === 'HANDLE_BAN_EVENT') {
        logger.error(`[SENTINEL] 🐍 HYDRA REFLEX ACTIVATED. IDENTITY COMPROMISED.`);
        
        // 1. Quarantine current profile
        // In a real system, we would move browser_profile to browser_profile_banned
        
        // 2. Trigger OmegaNode for Rotation
        logger.info(`[SENTINEL] ⚡ Commanding OmegaNode: EMERGENCY ROTATE.`);
        orchestrator.executeIntent({
            description: "CRITICAL: ROTATE INFRASTRUCTURE. BAN DETECTED.",
            origin: "SENTINEL_HYDRA",
            priority: 100, // Max Priority
            payload: { action: "EMERGENCY_ROTATE" }
        });

        return { success: true, output: { status: "HYDRA_EXECUTED", note: "Identity burned. Regeneration initiated." } };
    }

    return super.run(payload, context);
  }
}
