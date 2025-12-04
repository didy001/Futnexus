
import OpenAI from 'openai';
import logger from './logger.js';

/**
 * LlmClient - Hybrid Sovereign Intelligence
 * Supports Cloud (OpenRouter) and Local (Ollama/Llama.cpp)
 */
class LlmClient {
  constructor() {
    this.useLocal = process.env.USE_LOCAL_LLM === 'true';
    this.localEndpoint = process.env.LOCAL_LLM_URL || 'http://localhost:11434/api/chat';
    
    // Circuit Breaker State
    this.failures = 0;
    this.circuitOpen = false;
    this.lastFailureTime = 0;
    
    this.remoteClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || "dummy", // Prevent crash on missing key if using local
      defaultHeaders: {
        "HTTP-Referer": "https://nexus-omega.local",
        "X-Title": "Nexus Omega DevShadow",
      }
    });
  }

  async complete(config) {
    const { model, messages, temperature = 0.7 } = config;

    // 1. CIRCUIT BREAKER CHECK
    if (this.circuitOpen) {
        if (Date.now() - this.lastFailureTime > 60000) {
            logger.info("[LLM CLIENT] ⚡ Circuit Breaker Reset. Retrying Cloud...");
            this.circuitOpen = false;
            this.failures = 0;
        } else {
            logger.warn("[LLM CLIENT] 🛡️ Circuit Open. Routing to SAFE MODE (Local).");
            return this.callLocalLlama(messages);
        }
    }

    // 2. LOCAL PREFERENCE
    if (this.useLocal) {
        try {
            return await this.callLocalLlama(messages);
        } catch (e) {
            logger.warn("[LLM CLIENT] Local LLM failed. Falling back to Cloud.");
        }
    }

    // 3. CLOUD EXECUTION
    try {
        const completion = await this.remoteClient.chat.completions.create({
          model: model,
          messages: messages,
          temperature: temperature
        });
        this.failures = 0;
        return completion.choices[0]?.message?.content || "";

    } catch (error) {
        this.failures++;
        logger.error(`[LLM CLIENT] ☁️ Cloud API Error (${this.failures}/5): ${error.message}`);
        
        if (this.failures >= 5) {
            this.circuitOpen = true;
            this.lastFailureTime = Date.now();
            logger.error("[LLM CLIENT] 💥 TOO MANY ERRORS. OPENING CIRCUIT BREAKER.");
        }
        
        // Final Fallback attempt
        return this.callLocalLlama(messages);
    }
  }

  async callLocalLlama(messages) {
      try {
          // Standard Ollama format
          const response = await fetch(this.localEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  model: 'llama3', // or user configured model
                  messages: messages,
                  stream: false
              })
          });
          
          if (!response.ok) throw new Error("Local LLM Offline");
          
          const data = await response.json();
          return data.message?.content || "";
          
      } catch (e) {
          logger.error(`[LLM CLIENT] 🏠 Local Inference Failed: ${e.message}`);
          return " [SYSTEM CRITICAL]: ALL COGNITIVE ENGINES OFFLINE. UNABLE TO THINK.";
      }
  }

  async embed(text) {
      // Placeholder for local embedding if needed
      return new Array(768).fill(0.1); 
  }
}

export const llmClient = new LlmClient();
