
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { orchestrator } from '../orchestrator/Engine.js';
import { mnemosyne } from './mnemosyne.js';
import { skillForge } from './SkillForge.js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';

class Sensor {
  constructor() {
    this.inputDir = path.resolve('./nexus_input');
    // Ensure input directory exists
    if (!fs.existsSync(this.inputDir)) {
      fs.mkdirSync(this.inputDir, { recursive: true });
    }
  }

  init() {
    logger.info(`[SENSOR] 👁️ Watching physical input: ${this.inputDir}`);
    
    this.watcher = chokidar.watch(this.inputDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 0
    });

    this.watcher.on('add', async (filePath) => {
      const fileName = path.basename(filePath);
      logger.info(`[SENSOR] 📥 Physical file detected: ${fileName}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        await this.processDigitalInput(content, 'FILE', fileName);
        
        // Optional: Move to processed?
      } catch (err) {
        logger.error(`[SENSOR] Failed to read file ${fileName}:`, err);
      }
    });
  }

  /**
   * THE NEURAL UPLINK PROCESSOR
   * Direct injection of knowledge/tasks from Shadow.
   */
  async processDigitalInput(content, type = 'RAW', sourceName = 'Unknown') {
      logger.info(`[SENSOR] 🧠 Processing Neural Uplink: ${type} from ${sourceName}`);

      // 1. QUICK ANALYSIS (Classification)
      const classification = await cerebro.think(
          "FAST", 
          `Classify this data input.
           CONTENT SAMPLE: ${content.substring(0, 500)}...
           
           OPTIONS:
           - "CODE_SNIPPET": Reusable code function.
           - "KNOWLEDGE": Documentation, facts, notes.
           - "STRATEGY": Business plan, directive.
           - "DATASET": Raw data, CSV, logs.
           
           OUTPUT JSON: { "category": "...", "summary": "..." }`, 
          "You are a Data Classifier."
      );
      
      let meta = { category: 'KNOWLEDGE', summary: 'Imported data' };
      try { meta = JSON.parse(classification.replace(/```json/g,'').replace(/```/g,'').trim()); } catch(e) {}

      logger.info(`[SENSOR] Data classified as: ${meta.category}`);

      // 2. ROUTING LOGIC

      // A. CODE -> SKILL FORGE
      if (meta.category === 'CODE_SNIPPET') {
          await skillForge.learnSkill(
              sourceName.replace(/[^a-zA-Z0-9]/g, '_'), 
              content, 
              meta.summary, 
              ['uplink', 'shadow_code']
          );
          return { status: "ASSIMILATED", target: "SKILL_FORGE", meta };
      }

      // B. KNOWLEDGE -> MNEMOSYNE
      if (meta.category === 'KNOWLEDGE' || meta.category === 'STRATEGY') {
          await mnemosyne.saveLongTerm(content, { 
              source: sourceName, 
              type: meta.category, 
              origin: 'NEURAL_UPLINK' 
          });
          return { status: "MEMORIZED", target: "MNEMOSYNE", meta };
      }

      // C. ACTIONABLE STRATEGY -> ORCHESTRATOR
      if (meta.category === 'STRATEGY' && content.length < 2000) {
          // If it looks like an order, execute it too
          orchestrator.executeIntent({
              description: `Analyze and execute strategy from uplink: ${meta.summary}`,
              origin: "NEURAL_UPLINK",
              payload: { content },
              priority: 90
          });
          return { status: "ACTIVATED", target: "ORCHESTRATOR", meta };
      }

      return { status: "STORED", target: "ARCHIVES", meta };
  }
}

export const sensor = new Sensor();
