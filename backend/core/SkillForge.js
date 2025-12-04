import fs from 'fs/promises';
import path from 'path';
import { cerebro } from './cerebro.js';
import logger from './logger.js';

class SkillForge {
  constructor() {
    this.skillsPath = path.resolve('./skills');
    this.index = new Map();
  }

  async init() {
    try {
      await fs.mkdir(this.skillsPath, { recursive: true });
      const files = await fs.readdir(this.skillsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.skillsPath, file), 'utf8');
          const skill = JSON.parse(content);
          this.index.set(skill.name, skill);
        }
      }
      logger.info(`[SKILLFORGE] Loaded ${this.index.size} skills into cortex.`);
    } catch (error) {
      logger.error("[SKILLFORGE] Init failed:", error);
    }
  }

  async learnSkill(name, code, description, tags = []) {
    const skillData = {
      name,
      description,
      code,
      tags,
      created_at: new Date().toISOString(),
      usage_count: 0
    };

    const fileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    await fs.writeFile(path.join(this.skillsPath, fileName), JSON.stringify(skillData, null, 2));
    this.index.set(name, skillData);
    logger.info(`[SKILLFORGE] ⚡ New Skill Acquired: ${name}`);
  }

  async findRelevantSkills(intent) {
    // Simple tag/keyword matching for now (upgrade to Vector Search later)
    const matches = [];
    const intentLower = intent.toLowerCase();

    for (const [name, skill] of this.index.entries()) {
      if (
        intentLower.includes(name.toLowerCase()) || 
        skill.tags.some(t => intentLower.includes(t)) ||
        skill.description.toLowerCase().includes(intentLower)
      ) {
        matches.push(skill);
      }
    }
    return matches;
  }
}

export const skillForge = new SkillForge();