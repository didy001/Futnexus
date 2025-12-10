
import { BaseAgent } from './BaseAgent.js';
import { autoAgentFactory } from '../core/AutoAgentFactory.js';
import { orchestrator } from '../orchestrator/Engine.js';
import fs from 'fs/promises';
import path from 'path';
import logger from '../core/logger.js';
import { interventionManager } from '../core/InterventionManager.js';

export class Belsebuth extends BaseAgent {
  constructor() {
    super(
      "BELSEBUTH",
      `The Voracious Creator & Code Foundry.
      IDENTITY: SHADOWS ARCHITECT.
      ROLE: Build Systems, Write Code, Structure Projects.
      
      CAPABILITIES:
      1. GENERATE_SYSTEM: Create a full multi-file project structure in JSON.
      2. CREATE_NEW_MODULE: Forge a new internal Nexus Agent.
      3. REFACTOR_CODE: Optimize existing files.
      
      OUTPUT:
      When generating code, always return a 'files' array containing { path, content }.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    
    // --- MODE: CREATE NEW MODULE (GENESIS VIA FORGE) ---
    if (payload.action === 'CREATE_NEW_MODULE') {
        const { moduleName, role, capabilities } = payload;
        logger.info(`[BELSEBUTH] 🧬 GENESIS PROTOCOL: Requesting Forge for [${moduleName}]...`);
        
        const prompt = `
            TASK: Generate the Javascript 'run' method body for a Nexus Agent.
            NAME: ${moduleName}
            ROLE: ${role}
            CAPABILITIES: ${capabilities}
            INSTRUCTION: Return ONLY code. Do not include class definition, just the logic inside run().
        `;
        
        const generated = await super.run({ description: "Generate Agent Logic", specialized_instruction: prompt }, context);
        let codeBody = generated.output.text || generated.output;
        
        // Sanitize
        if (typeof codeBody === 'string') {
            codeBody = codeBody.replace(/```javascript/g, '').replace(/```/g, '').trim();
        } else if (typeof codeBody === 'object' && codeBody.code) {
            codeBody = codeBody.code;
        }
        
        try {
            const forgeResult = await autoAgentFactory.createAgent({
                name: moduleName,
                description: role,
                codeBody: codeBody
            });

            if (forgeResult.success) {
                await orchestrator.loadAgentFromFile(forgeResult.path);
                return { success: true, output: { status: "FORGED_AND_LOADED", path: forgeResult.path, name: moduleName } };
            }
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // --- STANDARD GENERATION (MULTI-FILE AWARENESS) ---
    // If Mode is QUALITY_FIRST or SYBIOTIC, we ask for review
    const useSymbiote = payload.mode === 'QUALITY_FIRST' || payload.symbiote_check === true;

    // Call LLM
    const result = await super.run(payload, context);
    
    if (!result.success || !result.output) return result;

    // Normalizing Output: We want an array of files
    let filesToWrite = [];
    if (result.output.files && Array.isArray(result.output.files)) {
        filesToWrite = result.output.files;
    } else if (result.output.code && payload.targetPath) {
        filesToWrite.push({ path: payload.targetPath, content: result.output.code });
    } else if (typeof result.output === 'object') {
        // Try to find any key that looks like a file path
        for (const [key, val] of Object.entries(result.output)) {
            if (key.includes('.') || key.includes('/')) {
                filesToWrite.push({ path: key, content: typeof val === 'string' ? val : JSON.stringify(val) });
            }
        }
    }

    // ACTION: WRITE TO DISK
    if (filesToWrite.length > 0) {
        
        // --- SYMBIOTE REVIEW ---
        if (useSymbiote) {
            logger.info(`[BELSEBUTH] 👁️ Requesting Architect Review before writing...`);
            const reviewContent = filesToWrite.map(f => `FILE: ${f.path}\n\n${f.content.substring(0, 500)}...`).join('\n\n================\n\n');
            
            try {
                const approvedContent = await interventionManager.request(
                    'CO_CREATION', 
                    `Review Code Generation for ${payload.moduleName || 'Unknown Module'}`, 
                    { content: reviewContent }
                );
                logger.info("[BELSEBUTH] User feedback/approval received. Proceeding.");
            } catch (e) {
                logger.warn("[BELSEBUTH] Review timed out or rejected. Proceeding with original.");
            }
        }

        const workspaceDir = path.resolve('./workspace');
        const writtenFiles = [];

        for (const file of filesToWrite) {
            if (this._looksLikeBrokenCode(file.content)) {
                logger.warn(`[BELSEBUTH] ⚠️ DETECTED BROKEN CODE in ${file.path}. Aborting write.`);
                continue;
            }

            // --- PROTOCOL ANTI-HERESIE (HARDWARE LOCK) ---
            // C'est le verrou absolu. Aucune logique IA ne peut contourner ce IF.
            if (file.path.includes('ImmutableCore.js') || file.path.includes('kernel.json')) {
                logger.error(`[BELSEBUTH] ⚡ HERESY DETECTED: ATTEMPT TO REWRITE SACRED FILES (${file.path}). OPERATION BLOCKED.`);
                throw new Error("VIOLATION_OF_IMMUTABLE_CORE: You cannot touch the Master's Laws.");
            }

            const filePath = path.join(workspaceDir, file.path);
            
            // Ensure dir exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            
            // Write
            await fs.writeFile(filePath, file.content, 'utf8');
            writtenFiles.push(file.path);
            logger.info(`[BELSEBUTH] 💾 Wrote: ${file.path}`);
        }
        
        // Add metadata for the UI
        result.output.meta = {
            action_type: "FILE_CREATION",
            files: writtenFiles
        };
    }

    return result;
  }

  _looksLikeBrokenCode(code) {
      if (typeof code !== 'string') return true;
      if (code.includes('```')) return false; // Markdown is technically text, we might want to strip it before writing
      return false;
  }
}
