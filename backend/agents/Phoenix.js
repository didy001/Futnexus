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
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
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