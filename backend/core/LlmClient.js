
import OpenAI from 'openai';
import logger from './logger.js';

/**
 * LlmClient - Hybrid Sovereign Intelligence
 * Supports Cloud (OpenRouter) and Local (Ollama/Llama.cpp/vLLM)
 */
class LlmClient {
  constructor() {
    this.useLocal = true; // Default to LOCAL for Sovereignty at boot
    
    // OMEGA UPGRADE: Configurable Endpoint for Dedicated Server (vLLM/RunPod)
    this.localEndpoint = process.env.LOCAL_LLM_URL || 'http://localhost:11434/api/chat';
    this.localModelName = process.env.LOCAL_MODEL_NAME || null; // Can force a specific model
    
    // Circuit Breaker State
    this.failures = 0;
    this.circuitOpen = false;
    this.lastFailureTime = 0;
    
    // Cloud Client (Optional at start)
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
    if (apiKey && apiKey.length > 10) {
        this.remoteClient = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: apiKey,
            defaultHeaders: {
                "HTTP-Referer": "https://nexus-omega.local",
                "X-Title": "Nexus Omega DevShadow",
            }
        });
        this.useLocal = false; // Upgrade to Cloud if key exists
        logger.info("[LLM CLIENT] ☁️ Cloud Uplink Detected. Primary Cortex: REMOTE.");
    } else {
        logger.info(`[LLM CLIENT] 🏠 No Cloud Key found. Primary Cortex: LOCAL (Sovereign Mode) targeting ${this.localEndpoint}`);
    }
  }

  async complete(config) {
    const { model, messages, temperature = 0.7 } = config;

    // 1. CIRCUIT BREAKER CHECK (Cloud Failures)
    if (this.circuitOpen && !this.useLocal) {
        if (Date.now() - this.lastFailureTime > 60000) {
            logger.info("[LLM CLIENT] ⚡ Circuit Breaker Reset. Retrying Cloud...");
            this.circuitOpen = false;
            this.failures = 0;
        } else {
            logger.warn("[LLM CLIENT] 🛡️ Circuit Open. Forcing SAFE MODE (Local).");
            return this.callLocalLlama(messages);
        }
    }

    // 2. LOCAL EXECUTION (If forced or configured)
    if (this.useLocal) {
        try {
            return await this.callLocalLlama(messages);
        } catch (e) {
            // If local fails and we have a remote client, try to escalate?
            if (this.remoteClient) {
                logger.warn("[LLM CLIENT] Local Brain Stalled. Escalating to Cloud...");
                // Fall through to cloud
            } else {
                logger.error("[LLM CLIENT] 💀 FATAL: Local Brain Dead. No Cloud backup.");
                throw e;
            }
        }
    }

    // 3. CLOUD EXECUTION
    try {
        if (!this.remoteClient) throw new Error("No Cloud Client Configured");

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
        
        if (this.failures >= 3) { // Stricter threshold
            this.circuitOpen = true;
            this.lastFailureTime = Date.now();
            logger.error("[LLM CLIENT] 💥 CLOUD FAILURE. FALLING BACK TO LOCAL.");
        }
        
        // Immediate Fallback attempt
        return this.callLocalLlama(messages);
    }
  }

  async callLocalLlama(messages) {
      try {
          // AUTO-DETECT MODEL IF NOT SET
          if (!this.localModelName) {
              try {
                  // OLLAMA SPECIFIC TAG CHECK
                  if (this.localEndpoint.includes('11434')) {
                      const tagsUrl = this.localEndpoint.replace('/api/chat', '/api/tags');
                      const tagsRes = await fetch(tagsUrl);
                      if (tagsRes.ok) {
                          const tagsData = await tagsRes.json();
                          if (tagsData.models && tagsData.models.length > 0) {
                              // Prefer Llama 3 70B if available
                              const bestModel = tagsData.models.find(m => m.name.includes('70b')) || tagsData.models[0];
                              this.localModelName = bestModel.name;
                              logger.info(`[LLM CLIENT] 🏠 Auto-detected Local Model: ${this.localModelName}`);
                          }
                      }
                  }
              } catch(e) { /* ignore */ }
              
              if (!this.localModelName) this.localModelName = 'llama3'; // Default fallback
          }

          // ADAPT PROTOCOL BASED ON ENDPOINT
          // If using vLLM (OpenAI Compatible) vs Ollama (Custom API)
          
          if (this.localEndpoint.includes('/v1/chat/completions')) {
              // vLLM / TGI Protocol
              const response = await fetch(this.localEndpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      model: this.localModelName || "hosted-model",
                      messages: messages,
                      temperature: 0.7,
                      max_tokens: 4096 // Higher limit for big models
                  })
              });
              
              if (!response.ok) throw new Error(`vLLM Server Error (${response.status})`);
              const data = await response.json();
              return data.choices[0]?.message?.content || "";

          } else {
              // Standard Ollama Protocol
              const response = await fetch(this.localEndpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      model: this.localModelName,
                      messages: messages,
                      stream: false,
                      options: { 
                          temperature: 0.7,
                          num_ctx: 8192 // Force higher context for complex tasks
                      }
                  })
              });
              
              if (!response.ok) throw new Error(`Local LLM Offline (${response.status})`);
              
              const data = await response.json();
              return data.message?.content || "";
          }
          
      } catch (e) {
          logger.error(`[LLM CLIENT] 🏠 Local Inference Failed: ${e.message}`);
          return " [SYSTEM CRITICAL]: COGNITIVE COLLAPSE. BOTH CLOUD AND LOCAL BRAINS UNRESPONSIVE.";
      }
  }

  async embed(text) {
      // Robust embedding fallback
      if (this.remoteClient && !this.circuitOpen) {
          try {
             return new Array(768).fill(0.1); 
          } catch(e) {}
      }
      return new Array(768).fill(0.1); 
  }
}

export const llmClient = new LlmClient();
