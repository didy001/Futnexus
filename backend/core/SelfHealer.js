
import logger from './logger.js';
import { orchestrator } from '../orchestrator/Engine.js';
import { mnemosyne } from './mnemosyne.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * MODULE: SELF HEALER (OROBOROS V2 - SOLIDIFIED)
 * Rôle: Système Auto-Immun Anti-Fragile.
 * Capture les erreurs, analyse la cause, et répare OU ampute.
 */
class SelfHealer {
  constructor() {
    this.healHistory = [];
    this.isHealing = false;
    
    // ANTI-LOOP MECHANISM
    this.errorCounts = new Map(); // Map<FilePath, { count, lastTime }>
    this.CRITICAL_THRESHOLD = 3; // Max repairs allowed per file
    this.TIME_WINDOW = 60000; // 1 Minute
  }

  /**
   * Point d'entrée principal pour toute erreur système.
   */
  async handleCriticalError(error, origin = "UNKNOWN") {
    if (this.isHealing && origin !== "BOOT_SEQUENCE") {
        logger.warn(`[SELF HEALER] ⚠️ Already conducting surgery. Error queued: ${error.message}`);
        return; 
    }

    this.isHealing = true;
    const errorSignature = `${origin}:${error.message}`;
    logger.error(`[SELF HEALER] 🚑 CRITICAL WOUND DETECTED: ${errorSignature}`);

    try {
        // 1. ANALYSE (Triage)
        const diagnosis = this._diagnose(error);
        
        logger.info(`[SELF HEALER] 🩺 Diagnosis: ${diagnosis.type} | Target: ${diagnosis.targetFile || 'SYSTEM'} | Action: ${diagnosis.action}`);

        // 2. TREATMENT
        if (diagnosis.action === 'CODE_REPAIR') {
            await this._safelyTriggerRepair(diagnosis.targetFile, error.message);
        } else if (diagnosis.action === 'RESTART_SERVICE') {
            await this._restartService(diagnosis.service);
        } else if (diagnosis.action === 'IGNORE_AND_LOG') {
            await mnemosyne.saveLongTerm("SYSTEM_ERROR_LOG", { error: error.message, stack: error.stack });
        } else if (diagnosis.action === 'QUARANTINE') {
            await this._quarantineFile(diagnosis.targetFile);
        }

        this.healHistory.push({ timestamp: Date.now(), error: error.message, action: diagnosis.action });

    } catch (e) {
        logger.error(`[SELF HEALER] 💀 FATAL: Healing Failed. System requires manual reset.`, e);
    } finally {
        this.isHealing = false;
    }
  }

  _diagnose(error) {
      const stack = error.stack || "";
      
      // CAS 1: Syntax Error / Code Bug
      if (stack.includes('SyntaxError') || stack.includes('ReferenceError') || stack.includes('TypeError') || stack.includes('Error:')) {
          // Extract filename from stack trace
          // Matches both /path/to/file.js and file:///path/to/file.js
          const match = stack.match(/\((.*\.js):\d+:\d+\)/) || stack.match(/at (.*\.js):\d+:\d+/) || stack.match(/at (.*\.js)/);
          
          if (match && match[1]) {
              let filePath = match[1];
              if (filePath.startsWith('file://')) filePath = filePath.replace('file://', '');
              
              // PROTECTION DU NOYAU
              if (filePath.includes('ImmutableCore') || filePath.includes('SelfHealer') || filePath.includes('kernel.json')) {
                  logger.error("[SELF HEALER] 🛡️ CORE VIOLATION DETECTED. CANNOT MODIFY SANCTUARY FILES.");
                  return { type: 'CORE_VIOLATION', action: 'IGNORE_AND_LOG' };
              }
              
              // CHECK LOOP (Is this file killing us repeatedly?)
              if (this._checkLoop(filePath)) {
                  return { type: 'NECROTIC_TISSUE', action: 'QUARANTINE', targetFile: filePath };
              }

              return { type: 'CODE_BUG', action: 'CODE_REPAIR', targetFile: filePath };
          }
      }

      // CAS 2: Network / API
      if (error.message.includes('fetch') || error.message.includes('ECONNRESET') || error.message.includes('400 Bad Request')) {
          return { type: 'NETWORK_FAILURE', action: 'IGNORE_AND_LOG' }; 
      }

      // Default
      return { type: 'UNKNOWN_TRAUMA', action: 'IGNORE_AND_LOG' };
  }

  _checkLoop(filePath) {
      const now = Date.now();
      const record = this.errorCounts.get(filePath) || { count: 0, lastTime: 0 };

      // Reset count if time window passed
      if (now - record.lastTime > this.TIME_WINDOW) {
          record.count = 0;
      }

      record.count++;
      record.lastTime = now;
      this.errorCounts.set(filePath, record);

      if (record.count > this.CRITICAL_THRESHOLD) {
          logger.error(`[SELF HEALER] 🔁 INFINITE LOOP DETECTED IN ${path.basename(filePath)}. ABORTING REPAIR.`);
          return true; // Loop detected
      }
      return false;
  }

  async _quarantineFile(filePath) {
      logger.warn(`[SELF HEALER] ☣️ QUARANTINING FILE: ${path.basename(filePath)}`);
      try {
          const newPath = filePath + '.corrupt';
          await fs.rename(filePath, newPath);
          logger.info(`[SELF HEALER] ✅ File disabled. System flow rerouted.`);
          
          // Notify Mnemosyne of the amputation
          await mnemosyne.saveLongTerm("SYSTEM_AMPUTATION", { file: filePath, reason: "Infinite Crash Loop" });
      } catch (e) {
          logger.error("Quarantine failed:", e);
      }
  }

  async _safelyTriggerRepair(filePath, errorMessage) {
      logger.info(`[SELF HEALER] 🔥 Summoning PHOENIX for surgery on: ${path.basename(filePath)}`);
      
      if (!orchestrator.agents['PHOENIX']) {
          logger.error("[SELF HEALER] Phoenix not available. Cannot heal.");
          // Try to create Phoenix if missing? (Advanced)
          return;
      }

      const result = await orchestrator.agents['PHOENIX'].run({
          action: 'AUTO_FIX',
          targetFile: filePath,
          error: errorMessage,
          description: "EMERGENCY CODE REPAIR"
      });

      if (result.success) {
          logger.info(`[SELF HEALER] ✅ Code Repaired. Vital signs stable.`);
          // Reload the agent if it was an agent file
          if (filePath.includes('agents')) {
              await orchestrator.loadAgentFromFile(filePath);
          }
      } else {
          logger.error(`[SELF HEALER] ❌ Repair Failed: ${result.error}`);
          // If repair fails, count it as a loop/error for next time
          this._checkLoop(filePath);
      }
  }

  async _restartService(service) {
      logger.info(`[SELF HEALER] 🔄 Restarting ${service}...`);
      // Logic placeholder for restarting specific modules if modularized
  }
}

export const selfHealer = new SelfHealer();
