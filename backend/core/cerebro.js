
import logger from './logger.js';
import { llmClient } from './LlmClient.js';

// MAPPING: Convert internal legacy model names to OpenRouter Model IDs
const MODEL_MAP = {
  "gemini-2.5-flash": "google/gemini-2.0-flash-lite-preview-02-05:free", 
  "gemini-pro": "google/gemini-2.0-pro-exp-02-05:free",
  "CODER": "deepseek/deepseek-r1:free",
  "CREATIVE": "liquid/lfm-40b:free",
  "FAST": "google/gemini-2.0-flash-lite-preview-02-05:free",
  "default": "google/gemini-2.0-flash-lite-preview-02-05:free"
};

class Cerebro {
  constructor() {
    this.client = llmClient;
  }

  _resolveModel(requestedModel) {
    if (MODEL_MAP[requestedModel]) return MODEL_MAP[requestedModel];
    if (requestedModel.includes("/")) return requestedModel; 
    return MODEL_MAP["default"];
  }

  async think(modelName, prompt, systemInstruction, tools = []) {
    try {
      const targetModel = this._resolveModel(modelName);
      
      const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
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
