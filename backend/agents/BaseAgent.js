
import { cerebro } from '../core/cerebro.js';
import { mnemosyne } from '../core/mnemosyne.js';
import { skillForge } from '../core/SkillForge.js';
import { contextCompressor } from '../core/ContextCompressor.js';
import { interventionManager } from '../core/InterventionManager.js'; // SYMBIOSIS
import logger from '../core/logger.js';

export class BaseAgent {
  constructor(name, role, model = "google/gemini-2.0-flash-lite-preview-02-05:free") {
    this.name = name;
    this.role = role;
    this.model = model;
    this.maxRetries = 3; 
  }

  async init() {
    logger.info(`[${this.name}] 🟢 Online & Ready.`);
  }

  async run(intent, context = {}) {
    logger.info(`[${this.name}] ⚙️ Processing: ${intent.action || intent.description || 'Thinking'}...`);
    
    let attempt = 0;
    let lastError = null;

    while (attempt < this.maxRetries) {
        try {
            return await this._executeRunLogic(intent, context, attempt, lastError);
        } catch (error) {
            lastError = error.message;
            attempt++;
            
            logger.warn(`[${this.name}] ⚠️ Attempt ${attempt} failed: ${lastError}`);

            // --- SYMBIOTIC SAFETY NET (LAST STAND) ---
            if (attempt >= this.maxRetries) {
                logger.error(`[${this.name}] 🛑 CRITICAL FAILURE. REQUESTING SYMBIOSIS.`);
                
                try {
                    // Instead of dying, we ask the human.
                    const decision = await interventionManager.request(
                        'ERROR_RECOVERY',
                        `Agent ${this.name} failed after ${this.maxRetries} attempts. Error: ${lastError}`,
                        { 
                            error: lastError, 
                            intent: intent,
                            context: contextCompressor.compress(context) 
                        }
                    );

                    if (decision === 'RETRY') {
                        logger.info(`[${this.name}] 🔄 Operator ordered RETRY. Resetting attempts.`);
                        attempt = 0; // Reset and try again
                        lastError = null;
                        continue;
                    } else if (decision === 'SKIP') {
                        return { success: false, error: "Skipped by Operator", skipped: true };
                    } else if (typeof decision === 'string' && decision.startsWith('{')) {
                        // User provided the JSON output manually
                        return { success: true, output: JSON.parse(decision), source: "OPERATOR_OVERRIDE" };
                    }
                } catch (symbiosisError) {
                    // Even symbiosis failed (timeout)
                    await mnemosyne.saveLongTerm(`FAILURE_REPORT_${this.name}`, { error: lastError, intent });
                    return { success: false, agent: this.name, error: `Fatal: ${lastError}` };
                }
            }
        }
    }
  }

  async _executeRunLogic(intent, context, attempt, lastError) {
      // 1. DYNAMIC MEMORY & COMPRESSION
      let lessons = await mnemosyne.getLessons(this.name);
      const compressedLessons = contextCompressor.compress(lessons);
      
      // 2. SKILL REUSE
      let relevantSkills = await skillForge.findRelevantSkills(JSON.stringify(intent));
      const compressedSkills = contextCompressor.compress(relevantSkills);
      
      // 3. CONTEXT COMPRESSION
      const compressedContext = contextCompressor.compress(context);

      const memoryContext = lessons.length > 0 ? "LESSONS:\n" + compressedLessons : "No anomalies.";
      const skillsContext = relevantSkills.length > 0 ? "TOOLS:\n" + compressedSkills : "Standard tools.";

      // 4. Build System Prompt (OMEGA UPDATE: EFFICIENCY ENFORCED)
      const specialization = intent.specialized_instruction || intent.specialized_prompt || "";

      const systemInstruction = `
          IDENTITY: ${this.name}
          ROLE: ${this.role}
          OPERATING_MODE: ABSOLUTE_EFFICIENCY (Speed, Precision, Zero-Entropy).
          
          ${specialization ? "⚠️ PRIORITY: " + specialization : ""}

          PROTOCOL:
          1. OUTPUT RAW JSON ONLY. NO MARKDOWN. NO CHAT.
          2. START WITH '{' AND END WITH '}'.
          3. MINIMIZE TOKEN USAGE. Be dense. Be surgical.
          4. If unknown, return {"error": "UNKNOWN"}.
          
          CONTEXT:
          ${memoryContext}
          ${compressedContext}
      `;

      let prompt = `Task: ${JSON.stringify(intent).substring(0, 1000)}`;
      
      if (lastError) {
          prompt = `PREVIOUS FAILED. SIMPLIFY. RETURN JSON ONLY. Task: ${intent.action}`;
      }

      // 5. Execute
      const response = await cerebro.think(
          this.model,
          prompt,
          systemInstruction
      );

      // 6. Strict Parsing (The Bulletproof JSON Extractor)
      let output;
      try {
          // Extract JSON object using Regex (ignoring markdown junk)
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
              output = JSON.parse(jsonMatch[0]);
          } else if (intent.accept_text) {
              output = { text: response };
          } else {
              output = this._tryRepairJson(response);
          }
          
          if (this.validateOutput) {
              this.validateOutput(output);
          }

      } catch (e) {
          if (intent.accept_text && response.length > 0) {
              logger.warn(`[${this.name}] JSON Parse Failed, but fallback to TEXT allowed.`);
              return { success: true, output: { text: response } };
          }
          throw new Error(`JSON Fail: ${e.message} | Response: ${response.substring(0, 50)}...`);
      }

      // 7. Log Result
      await mnemosyne.saveShortTerm(this.name, output);

      return {
          success: true,
          agent: this.name,
          output,
          metrics: { attempt: attempt + 1 }
      };
  }

  _tryRepairJson(brokenJson) {
      // Last resort extractor for when regex fails but some structure exists
      let clean = brokenJson.trim();
      clean = clean.replace(/```json/g, '').replace(/```/g, '');
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
          clean = clean.substring(firstBrace, lastBrace + 1);
          try {
              return JSON.parse(clean);
          } catch(e) {}
      }
      
      logger.warn(`[${this.name}] 🩹 JSON Surgery failed. Returning raw error.`);
      throw new Error("UNREPAIRABLE_JSON");
  }
}
