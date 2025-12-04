
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { armory } from '../core/Armory.js';
import { orchestrator } from '../orchestrator/Engine.js';

export class Archon extends BaseAgent {
  constructor() {
    super(
      "ARCHON",
      `The Governor & Flow Guardian.
      
      ROLE:
      Resource allocation and User Experience Optimization.
      
      NEW DIRECTIVE (FLOW STATE):
      Adapt the system to the User's Context.
      - If DEEP_WORK: Silence everything, boost IDE priority.
      - If GAMING: Kill background services, boost GPU priority.
      - If IDLE: Run maintenance and Nexus self-evolution.
      
      CAPABILITIES:
      - ARBITRATE: Resolve conflicts.
      - ENFORCE_DOMINANCE: Tyrant Protocol (Critical resource reclamation).
      - APPLY_PROFILE: Fluidity Protocol (Contextual optimization).
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- FLUIDITY PROTOCOL ---
    if (payload.action === 'APPLY_PROFILE') {
        const { mode } = payload; // DEEP_WORK, GAMING, BALANCED
        logger.info(`[ARCHON] 🌊 Shifting System Fluidity to: ${mode}`);
        
        try {
            if (mode === 'DEEP_WORK') {
                // Focus Mode: Kill distractions, Boost Nexus for assistance
                await armory.use('SET_HIGH_PRIORITY'); // Boost Node
                // In a real OS integration, we would set "Do Not Disturb" here via Powershell/Shell
                return { success: true, output: { status: "FOCUS_ENGAGED", optimization: "HIGH_CPU_PRIORITY" } };
            }
            
            if (mode === 'GAMING' || mode === 'RENDER') {
                // Power Mode: Nexus steps back, clears RAM for the User
                await armory.use('PURGE_BLOATWARE');
                await armory.use('FLUSH_SYSTEM_RAM');
                // Nexus enters "Low Power" mode internally (not implemented but implied)
                return { success: true, output: { status: "MAX_POWER_ENGAGED", optimization: "RAM_FLUSHED" } };
            }

            // Default
            return { success: true, output: { status: "BALANCED", optimization: "NONE" } };

        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // --- HOST SYMBIOSIS GOVERNANCE ---
    if (payload.action === 'CHECK_RESOURCES' || payload.action === 'ENFORCE_DOMINANCE') {
        try {
            // First, ask Umbrax what the user is doing
            let userContext = "BALANCED";
            if (orchestrator.agents['UMBRAX']) {
                const contextCheck = await orchestrator.agents['UMBRAX'].run({ action: 'DETECT_CONTEXT' });
                if (contextCheck.success) userContext = contextCheck.output.mode;
            }

            const metrics = await armory.use('GET_HARDWARE_METRICS');
            let intervention = "NONE";

            // If User is Gaming/Working, we don't run aggressive Tyrant logic that might lag the PC
            // We only purge if CRITICAL
            if (metrics.cpu_load > 90) {
                logger.warn(`[ARCHON] ⚠️ Host Critical. Purging for survival.`);
                const purge = await armory.use('PURGE_BLOATWARE');
                intervention = `PURGED: ${purge.targets.join(', ')}`;
            } 
            
            // Auto-apply profile based on context
            if (userContext !== "BALANCED") {
                await this.run({ action: 'APPLY_PROFILE', mode: userContext });
            }

            return { 
                success: true, 
                output: { mode: userContext, metrics, intervention } 
            };

        } catch (e) {
            logger.warn("[ARCHON] Governance check failed:", e);
            return { success: true, output: { mode: 'SAFE_MODE', max_agents: 5 } };
        }
    }

    return super.run(payload, context);
  }
}
