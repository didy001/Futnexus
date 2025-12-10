
import logger from './logger.js';
import { llmClient } from './LlmClient.js';
import { evolutionaryEngine } from '../modules/EvolutionaryEngine.js';

// MAPPING: Convert internal legacy model names to OpenRouter Model IDs
// SECURITY NOTE: We ensure STANDARD is competent.
const MODEL_MAP = {
  "gemini-2.5-flash": "google/gemini-2.0-flash-lite-preview-02-05:free", 
  
  // STANDARD = The baseline (High speed, good logic). NOT STUPID.
  "STANDARD": "google/gemini-2.0-flash-lite-preview-02-05:free",
  
  // ENHANCED = Better reasoning for specific tasks
  "ENHANCED": "google/gemini-2.0-pro-exp-02-05:free", 
  
  // ADVANCED/GOD = The Beast (Pro/Ultra logic)
  "ADVANCED": "google/gemini-2.0-pro-exp-02-05:free",
  "GOD": "google/gemini-2.0-pro-exp-02-05:free",
  
  // SPECIALISTS
  "CODER": "deepseek/deepseek-r1:free", // DeepSeek is best for code
  "CREATIVE": "liquid/lfm-40b:free",
  "FAST": "google/gemini-2.0-flash-lite-preview-02-05:free",
  "default": "google/gemini-2.0-flash-lite-preview-02-05:free"
};

class Cerebro {
  constructor() {
    this.client = llmClient;
  }

  _resolveModel(requestedModel) {
    // 1. EVOLUTIONARY OVERRIDE (The Singularity Effect)
    const perks = evolutionaryEngine.getPerks();
    
    // S-Rank: Force GOD TIER intelligence
    if (perks.model_tier === "GOD") {
        if (requestedModel !== "CODER") return MODEL_MAP["GOD"];
    }
    
    // A-Rank: Force ADVANCED intelligence
    if (perks.model_tier === "ADVANCED") {
        if (requestedModel === "gemini-2.5-flash") return MODEL_MAP["ADVANCED"];
    }

    // BASELINE PROTECTION: Even at Rank E, we respect specific requests like "CODER"
    if (MODEL_MAP[requestedModel]) return MODEL_MAP[requestedModel];
    if (requestedModel.includes("/")) return requestedModel; 
    
    // Default fallback to STANDARD (which is now competent)
    return MODEL_MAP["STANDARD"];
  }

  async think(modelName, prompt, systemInstruction, image = null) {
    try {
      const targetModel = this._resolveModel(modelName);
      
      let userContent;

      // OCULUS PROTOCOL: Multimodal Payload Construction
      if (image) {
          logger.info(`[CEREBRO] 👁️ OCULUS ACTIVE. Processing visual input...`);
          userContent = [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } } // image expects base64 data url
          ];
      } else {
          userContent = prompt;
      }

      const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent }
      ];

      const result = await this.client.complete({
        model: targetModel,
        messages: messages,
        temperature: 0.7
      });

      // SANITY CHECK OMEGA
      if (!result || result.trim().length === 0) {
          logger.warn(`[CEREBRO] ⚠️ Empty thought detected. Retrying with higher temperature...`);
          return await this.client.complete({
            model: targetModel,
            messages: messages,
            temperature: 0.9 // Higher creativity to break deadlock
          });
      }

      return result;

    } catch (error) {
      logger.error("CEREBRO ERROR:", error);
      // Fallback response to prevent system crash
      return JSON.stringify({ error: "Brain Offline", details: error.message, suggestion: "Check API Quota or Connectivity" });
    }
  }

  async embed(text) {
    return await this.client.embed(text);
  }
}

export const cerebro = new Cerebro();
