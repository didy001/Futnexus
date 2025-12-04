
import { BaseAgent } from './BaseAgent.js';
import { autoAgentFactory } from '../core/AutoAgentFactory.js';
import { orchestrator } from '../orchestrator/Engine.js';
import fs from 'fs/promises';
import path from 'path';
import logger from '../core/logger.js';

export class Belsebuth extends BaseAgent {
  constructor() {
    super(
      "BELSEBUTH",
      `The Voracious Creator & Code Foundry.
      
      IDENTITY: SHADOWS ARCHITECT.
      
      ROLE:
      You do not just "write code". You build SYSTEMS.
      Every output must be production-ready, error-handled, and strictly typed (JSDoc/TS).
      
      CAPABILITIES:
      1. GENERATE_SYSTEM: Create a multi-file stack (Logic + Config + Tests).
      2. CREATE_NEW_MODULE: Forge a new Agent via the Factory.
      3. REFACTOR_MERCILLESSLY: Take bad code and force it into the Shadows Standard (Clean, Modular, Robust).
      
      CRITICAL: 
      - Always include comments explaining "WHY", not just "WHAT".
      - Never hallucinate imports. Use only what is available in the stack.
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
            
            INSTRUCTION:
            Return ONLY the code for the run method logic. Do not include class definition.
            Assume 'payload' and 'context' are available.
            Use 'return super.run(payload, context);' at the end or if unhandled.
            KEEP IT SIMPLE, FAST, AND ERROR-PROOF.
        `;
        
        const generated = await super.run({ description: "Generate Agent Logic", specialized_prompt: prompt }, context);
        let codeBody = generated.output.text || generated.output;
        
        // Sanitize
        if (typeof codeBody === 'string') {
            codeBody = codeBody.replace(/```javascript/g, '').replace(/```/g, '').trim();
        } else if (typeof codeBody === 'object' && codeBody.code) {
            codeBody = codeBody.code;
        }
        
        // Use the Forge to create the file safely
        try {
            const forgeResult = await autoAgentFactory.createAgent({
                name: moduleName,
                description: role,
                codeBody: codeBody
            });

            if (forgeResult.success) {
                // Hot Swap into Orchestrator
                await orchestrator.loadAgentFromFile(forgeResult.path);
                return { success: true, output: { status: "FORGED_AND_LOADED", path: forgeResult.path, name: moduleName } };
            }
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // --- MODE: REFACTOR (CLEANUP) ---
    if (payload.action === 'REFACTOR') {
        logger.info(`[BELSEBUTH] 🧹 Refactoring Target: ${payload.targetFile}`);
        // Logic to read file, prompt LLM for optimization, and overwrite
        // Placeholder for now, falls back to standard generation
        payload.description = `Read ${payload.targetFile}, analyze its weaknesses, and rewrite it to be Modular, Robust, and Efficient.`;
    }

    // --- STANDARD GENERATION (MULTI-FILE AWARENESS) ---
    const result = await super.run(payload, context);
    
    if (!result.success || !result.output) return result;

    // Handle single code block output vs multi-file output
    let filesToWrite = [];
    
    if (result.output.files) {
        filesToWrite = result.output.files;
    } else if (result.output.code && payload.targetPath) {
        filesToWrite.push({ path: payload.targetPath, content: result.output.code });
    }

    if (filesToWrite.length > 0) {
        const workspaceDir = path.resolve('./workspace');
        const writtenFiles = [];

        for (const file of filesToWrite) {
            // BASIC SYNTAX VALIDATION (Simulated)
            if (this._looksLikeBrokenCode(file.content)) {
                logger.warn(`[BELSEBUTH] ⚠️ DETECTED BROKEN CODE in ${file.path}. Aborting write.`);
                return { success: false, error: "Code Generation failed Syntax Check." };
            }

            const filePath = path.join(workspaceDir, file.path);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, file.content, 'utf8');
            writtenFiles.push(file.path);
            logger.info(`[BELSEBUTH] 💾 Wrote: ${file.path}`);
        }
        
        result.output.written_files = writtenFiles;
    }

    return result;
  }

  _looksLikeBrokenCode(code) {
      // Extremely basic heuristic check
      if (typeof code !== 'string') return true;
      if (code.includes('```')) return false; // Markdown blocks are handled later usually, but inside content is bad
      if (code.split('{').length !== code.split('}').length) return true; // Unbalanced braces
      return false;
  }
}
