
import { cerebro } from '../core/cerebro.js';
import { mnemosyne } from '../core/mnemosyne.js';
import { skillForge } from '../core/SkillForge.js';
import logger from '../core/logger.js';

export class BaseAgent {
  // Default to a high-quality free model on OpenRouter
  constructor(name, role, model = "google/gemini-2.0-flash-lite-preview-02-05:free") {
    this.name = name;
    this.role = role;
    this.model = model;
    this.maxRetries = 3; // OMEGA STANDARD: Persistence
  }

  async init() {
    logger.info(`[${this.name}] 🟢 Online & Ready.`);
  }

  /**
   * THE OMEGA RUN LOOP
   * Auto-corrects errors, validates JSON, and enforces strict standards.
   */
  async run(intent, context = {}) {
    logger.info(`[${this.name}] ⚙️ Processing: ${intent.action || 'Thinking'}...`);
    
    let attempt = 0;
    let lastError = null;

    while (attempt < this.maxRetries) {
        try {
            // 1. DYNAMIC MEMORY (The "Experience")
            const lessons = await mnemosyne.getLessons(this.name);
            
            // 2. SKILL REUSE (The "Forge")
            const relevantSkills = await skillForge.findRelevantSkills(JSON.stringify(intent));
            
            const memoryContext = lessons.length > 0 
                ? "PAST LESSONS (ADAPT & OVERCOME):\n" + lessons.map(l => `- ${l}`).join('\n')
                : "No prior anomalies detected.";

            const skillsContext = relevantSkills.length > 0
                ? "AVAILABLE TOOLS (USE TO OPTIMIZE):\n" + relevantSkills.map(s => `Name: ${s.name}\nCode:\n${s.code}`).join('\n---\n')
                : "Standard toolset only.";

            // 3. Build System Prompt (Industrial Grade)
            const systemInstruction = `
                IDENTITY: ${this.name} (NEXUS OMEGA MODULE)
                ROLE: ${this.role}
                
                === PROTOCOL: OMEGA PERFECT FORM ===
                1. NO FLUFF. Output must be raw, actionable data.
                2. NO HALLUCINATIONS. If you don't know, state "UNKNOWN".
                3. STRICT JSON. Output must be valid JSON unless requested otherwise.
                
                === ADAPTIVE MEMORY ===
                ${memoryContext}
                
                === SKILL FORGE ===
                ${skillsContext}
                
                === CURRENT CONTEXT ===
                ${JSON.stringify(context)}
            `;

            let prompt = `Task: ${JSON.stringify(intent)}`;
            
            // If this is a retry, inject the error to force self-correction
            if (lastError) {
                prompt += `\n\n⚠️ PREVIOUS ATTEMPT FAILED: ${lastError}\nCORRECT YOUR SYNTAX AND RETRY.`;
                logger.warn(`[${this.name}] 🔄 Self-Correction Attempt ${attempt + 1}...`);
            }

            // 4. Execute
            const response = await cerebro.think(
                this.model,
                prompt,
                systemInstruction
            );

            // 5. Strict Parsing & Validation
            let output;
            try {
                // Aggressive cleaning of Markdown wrappers
                const cleanJson = response
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                
                output = JSON.parse(cleanJson);
                
                // Hook for subclass validation (optional)
                if (this.validateOutput) {
                    this.validateOutput(output);
                }

            } catch (e) {
                // If simple text is acceptable, return it, otherwise treat as failure
                if (intent.accept_text) {
                    output = { text: response };
                } else {
                    throw new Error(`JSON Parsing Failed: ${e.message} \nRaw: ${response.substring(0, 50)}...`);
                }
            }

            // 6. Log Result (Short Term)
            await mnemosyne.saveShortTerm(this.name, output);

            return {
                success: true,
                agent: this.name,
                output,
                metrics: { attempt: attempt + 1 }
            };

        } catch (error) {
            lastError = error.message;
            attempt++;
            
            if (attempt >= this.maxRetries) {
                logger.error(`[${this.name}] ❌ CRITICAL FAILURE after ${this.maxRetries} attempts:`, error);
                
                // Learn from this failure automatically
                await mnemosyne.saveLongTerm(`FAILURE_REPORT_${this.name}`, { error: lastError, intent });
                
                return {
                    success: false,
                    agent: this.name,
                    error: `Max Retries Exceeded: ${error.message}`
                };
            }
        }
    }
  }
}
