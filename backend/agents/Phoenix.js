
import { BaseAgent } from './BaseAgent.js';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs/promises';
import logger from '../core/logger.js';

const execAsync = util.promisify(exec);

export class Phoenix extends BaseAgent {
  constructor() {
    super(
      "PHOENIX",
      `System Executor & Self-Healer.
      
      PERFECT SKILL: PERFECT RECONSTRUCTION
      
      CAPABILITIES:
      1. EXECUTE: Run shell commands.
      2. TEST_AND_MERGE: Apply patches to system core.
      3. AUTO_FIX: Analyze broken code and rewrite it to fix a specific error.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- MODE: AUTO FIX (SURGERY) ---
    if (payload.action === 'AUTO_FIX') {
        const { targetFile, error } = payload;
        logger.info(`[PHOENIX] 🩹 SURGERY PROTOCOL: Fixing ${path.basename(targetFile)}`);

        try {
            // 1. Read Broken Code
            const code = await fs.readFile(targetFile, 'utf8');
            
            // 2. Generate Fix via LLM (Super call)
            // OMEGA UPDATE: Strict Instructions to prevent regressions
            const prompt = `
                CRITICAL SYSTEM ERROR DETECTED.
                FILE: ${targetFile}
                ERROR: ${error}
                
                BROKEN CODE:
                ${code}
                
                TASK:
                Rewrite the code to fix the error.
                
                STRICT SURGICAL RULES:
                1. DO NOT remove imports unless they are the cause of the error.
                2. DO NOT change the Class Name.
                3. DO NOT remove the 'export' statement.
                4. KEEP the constructor logic intact unless it's the bug.
                5. RETURN THE FULL FILE CONTENT (Not just the diff).
                
                OUTPUT: Full Javascript Code.
            `;
            
            const fixResult = await super.run({
                description: "Fixing Code",
                specialized_instruction: prompt,
                mode: "QUALITY_FIRST"
            }, context);

            let fixedCode = fixResult.output.code || fixResult.output.text || fixResult.output;
            if (typeof fixedCode === 'object') fixedCode = JSON.stringify(fixedCode);
            
            // Sanitize
            fixedCode = fixedCode.replace(/```javascript/g, '').replace(/```/g, '').trim();

            // 3. Syntax Check (Safety)
            const tempFile = targetFile + '.temp.js';
            await fs.writeFile(tempFile, fixedCode);
            
            try {
                await execAsync(`node --check "${tempFile}"`);
            } catch (syntaxErr) {
                await fs.unlink(tempFile);
                logger.error(`[PHOENIX] ❌ Generated Fix Invalid (Syntax Error). Aborting.`);
                return { success: false, error: "Generated fix had syntax errors." };
            }

            // 4. Apply
            await fs.copyFile(targetFile, targetFile + '.bak'); // Backup
            await fs.rename(tempFile, targetFile); // Overwrite
            
            return { success: true, output: { status: "FIXED", file: targetFile } };

        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // --- MODE: TEST AND MERGE ---
    if (payload.action === 'TEST_AND_MERGE') {
      const { targetFile, patchFile } = payload;
      logger.info(`[PHOENIX] 🔄 Processing Patch for ${targetFile}`);

      const workspaceRoot = path.resolve('./workspace');
      const patchAbsPath = path.join(workspaceRoot, patchFile);
      const targetAbsPath = path.resolve(targetFile);

      try {
        // Syntax Check
        await execAsync(`node --check "${patchAbsPath}"`);
        
        // Backup & Apply
        await fs.copyFile(targetAbsPath, `${targetAbsPath}.bak`);
        await fs.copyFile(patchAbsPath, targetAbsPath);
        
        logger.info(`[PHOENIX] ✅ Patch Merged Successfully.`);
        return { success: true, output: { status: "MERGED", file: targetFile } };

      } catch (err) {
        logger.error(`[PHOENIX] Patch Failed Validation:`, err);
        return { success: false, error: "Syntax Error or I/O Fail" };
      }
    }

    // --- MODE: EXECUTE ---
    const res = await super.run(payload, context);
    if (res.success && res.output.command) {
        try {
            const { stdout } = await execAsync(res.output.command, { cwd: path.resolve('./workspace') });
            return { success: true, output: { stdout: stdout.trim() } };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    return res;
  }
}
