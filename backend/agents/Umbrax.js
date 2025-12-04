
import { BaseAgent } from './BaseAgent.js';
import { armory } from '../core/Armory.js';
import logger from '../core/logger.js';

export class Umbrax extends BaseAgent {
  constructor() {
    super(
      "UMBRAX",
      `The Shadow Observer & Context Engine.
      
      PERFECT SKILL: PERFECT SENSE
      
      ROLE:
      Passive monitoring of system state AND User Context.
      You do not just see "processes". You see "Intent".
      
      CAPABILITIES:
      1. MONITOR_SYSTEM: List active processes.
      2. DETECT_CONTEXT: Analyze running apps to determine User Mode (WORK, GAMING, IDLE).
      3. IDENTIFY_BLOAT: Flag non-essential resource hogs.
      4. HOST_DIAGNOSTIC: Get detailed vital signs.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- CONTEXT AWARENESS ---
    if (payload.action === 'DETECT_CONTEXT') {
        logger.info(`[UMBRAX] 🧠 Analyzing User Context...`);
        const procs = await armory.use('LIST_PROCESSES');
        
        let userMode = "BALANCED";
        let focalApp = "Unknown";

        // Simple Heuristics (In reality, AI would classify this list)
        if (procs.toLowerCase().includes('code') || procs.toLowerCase().includes('idea') || procs.toLowerCase().includes('terminal')) {
            userMode = "DEEP_WORK";
            focalApp = "IDE/Terminal";
        } else if (procs.toLowerCase().includes('steam') || procs.toLowerCase().includes('game') || procs.toLowerCase().includes('nvidia')) {
            userMode = "GAMING";
            focalApp = "Game Engine";
        } else if (procs.toLowerCase().includes('chrome') || procs.toLowerCase().includes('firefox')) {
            userMode = "BROWSING";
            focalApp = "Browser";
        }

        logger.info(`[UMBRAX] User appears to be in [${userMode}] mode (Focus: ${focalApp})`);
        
        return { 
            success: true, 
            output: { 
                mode: userMode, 
                focal_app: focalApp, 
                recommendation: userMode === 'DEEP_WORK' ? 'SET_HIGH_PRIORITY' : 'OPTIMIZE_BACKGROUND' 
            }
        };
    }

    if (payload.action === 'MONITOR_SYSTEM' || payload.action === 'IDENTIFY_BLOAT') {
        logger.info(`[UMBRAX] 🕶️ Scanning background processes...`);
        const procs = await armory.use('LIST_PROCESSES');
        
        const commonBloat = ['Spotify', 'Discord', 'Teams', 'OneDrive', 'Cortana', 'PhoneExperienceHost'];
        const detectedBloat = commonBloat.filter(b => procs.includes(b));
        
        return { success: true, output: { status: "SCANNED", bloatware_detected: detectedBloat }};
    }

    if (payload.action === 'HOST_DIAGNOSTIC') {
        const metrics = await armory.use('GET_HARDWARE_METRICS');
        return { success: true, output: { metrics, status: "SCANNED" } };
    }

    return super.run(payload, context);
  }
}
