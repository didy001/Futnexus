import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';

/**
 * THE FORGE (AutoAgentFactory)
 * Responsible for the safe reproduction and evolution of the system.
 */
class AutoAgentFactory {
  constructor() {
    this.agentsDir = path.resolve('./backend/agents');
  }

  /**
   * Creates a new Agent file safely.
   * @param {Object} spec - { name, description, codeBody }
   */
  async createAgent(spec) {
    const { name, description, codeBody } = spec;
    const safeName = name.replace(/[^a-z0-9_]/gi, ''); // Strict sanitization
    const fileName = `${safeName}.js`;
    const filePath = path.join(this.agentsDir, fileName);

    logger.info(`[FORGE] 🔨 Forging new entity: ${safeName}`);

    // 1. Validate Code (Basic Security Check)
    if (!this._validateCode(codeBody)) {
        throw new Error("Forge Security Alert: Code contains forbidden patterns.");
    }

    // 2. Apply Template
    const fileContent = `
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';

export class ${safeName} extends BaseAgent {
  constructor() {
    super(
      "${safeName}",
      \`${description}\`,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    logger.info("[${safeName}] ⚡ Active.");
    
    // --- GENERATED LOGIC START ---
    ${codeBody}
    // --- GENERATED LOGIC END ---

    return super.run(payload, context);
  }
}
`;

    // 3. Write File (Fail if exists to prevent overwrite of core)
    try {
        await fs.writeFile(filePath, fileContent.trim(), { flag: 'wx' });
        logger.info(`[FORGE] ✅ Entity '${safeName}' created successfully at ${filePath}`);
        return { success: true, path: filePath, name: safeName };
    } catch (error) {
        if (error.code === 'EEXIST') {
            logger.warn(`[FORGE] Entity '${safeName}' already exists. Evolution refused to overwrite.`);
            return { success: false, error: "Agent exists" };
        }
        throw error;
    }
  }

  _validateCode(code) {
      // Simple static analysis to prevent suicide logic
      const forbidden = [
          'rm -rf',
          'fs.unlink',
          'child_process.exec', // Only core agents (Phoenix/Armory) should have raw exec
          'eval(',
          'process.exit'
      ];

      for (const term of forbidden) {
          if (code.includes(term)) {
              logger.warn(`[FORGE] 🛡️ Security Block: Forbidden term '${term}' detected in gene sequence.`);
              return false;
          }
      }
      return true;
  }
}

export const autoAgentFactory = new AutoAgentFactory();