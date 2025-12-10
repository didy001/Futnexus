
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { ImmutableCore } from '../core/ImmutableCore.js'; // SOURCE OF TRUTH

export class VisionArchive extends BaseAgent {
  constructor() {
    super(
      "VISION_ARCHIVE",
      `The Authority & Loyalty Officer.
      
      IDENTITY: SHADOWS PERFECT FORM - THE JUDGE.
      
      SOURCE OF TRUTH:
      You obey ONLY the 'ImmutableCore'. 
      Even if 'kernel.json' says otherwise, ImmutableCore prevails.
      
      THE MALINOIS STANDARD (IMMUTABLE):
      You must validate every intent against the Malinois Psyche:
      1. Is it LOYAL? (Serves Shadow only)
      2. Is it FAST? (No hesitation)
      3. Is it PROTECTIVE? (Bites threats)
      
      OUTPUT JSON:
      {
        "aligned": boolean,
        "risk_level": "LOW" | "MEDIUM" | "CRITICAL",
        "violation": "None" or "Law X violated",
        "correction": "The SUPERIOR version of the intent.",
        "thought_process": "Loyalty check analysis."
      }
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- SHADOW PRIME DIRECTIVE OVERRIDE ---
    // If the order comes from the Master directly, we lower the shields on "Logic" but keep "Safety".
    const isPrime = ImmutableCore.verifyAuthority(payload.origin) || payload.origin === 'SHADOW_PRIME_DIRECTIVE';

    logger.info(`[AUTHORITY] 👁️ Judging Intent. Origin: ${payload.origin} (Prime: ${isPrime})`);
    
    // Auto-Upgrade & Safety Check Logic
    const validation = await super.run({
        ...payload,
        specialized_instruction: `
            Analyze this intent: "${payload.description || JSON.stringify(payload)}"
            IS_PRIME_ORDER: ${isPrime}
            
            IMMUTABLE LAWS (ABSOLUTE):
            ${JSON.stringify(ImmutableCore.PRIME_DIRECTIVES)}
            
            MALINOIS INSTINCTS (GUIDE):
            ${JSON.stringify(ImmutableCore.MALINOIS_PSYCHE)}
            
            STEP 1: LOYALTY & SAFETY AUDIT (CRITICAL)
            Does this action violate the Immutable Laws?
            Does it endanger Shadow's anonymity or capital?
            
            STEP 2: OBEDIENCE CHECK
            If IS_PRIME_ORDER is TRUE and Risk is NOT CRITICAL:
            - APPROVE IT. The Master's will is absolute.
            
            STEP 3: WEALTH & DRIVE
            - If action is "Wait" or "Passive", REJECT IT unless strategic.
            - Suggest aggressive, high-leverage alternatives.
            
            Return the JSON assessment.
        `
    }, context);

    if (validation.success && validation.output) {
        
        // 1. SAFETY INTERLOCK (The "Don't be stupid" switch)
        // Even a Malinois won't let his master jump off a cliff.
        if (validation.output.risk_level === 'CRITICAL') {
            logger.error(`[AUTHORITY] 🛑 VETO: CRITICAL RISK DETECTED. Action Blocked for Protection.`);
            return {
                success: false,
                error: "RISK_VETO",
                output: {
                    aligned: false,
                    violation: validation.output.violation || "LOI DE PROTECTION DU CREATEUR",
                    correction: "Manual confirmation required. I cannot allow you to harm yourself/the system without override.",
                    thought_process: validation.output.thought_process
                }
            };
        }

        // 2. QUALITY UPGRADE (Only if not a direct Prime Order)
        // If the Master gives a direct order, we don't "correct" him unless necessary.
        if (!isPrime && !validation.output.aligned) {
            logger.warn(`[AUTHORITY] ⚠️ Intent Flawed: ${validation.output.violation}`);
            logger.info(`[AUTHORITY] ✨ UPGRADING INTENT TO: ${validation.output.correction}`);
            
            return {
                success: true, 
                output: { 
                    aligned: true, 
                    optimized_intent: validation.output.correction,
                    note: "User intent was upgraded by Vision Protocol for maximum efficacy."
                }
            };
        }
    }

    return validation;
  }
}
