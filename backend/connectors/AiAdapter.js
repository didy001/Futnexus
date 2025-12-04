import OpenAI from 'openai';
import logger from '../core/logger.js';

export class AiAdapter {
  constructor() {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || process.env.API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://nexus-omega.local",
        "X-Title": "Nexus Omega Adapter"
      }
    });
  }

  async send(config) {
    // Config: { model, prompt, system }
    const { model, prompt, system = "You are a helpful assistant." } = config;
    
    logger.info(`[AI ADAPTER] Calling External Model: ${model}`);

    try {
      const completion = await this.client.chat.completions.create({
        model: model || "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ]
      });
      return completion.choices[0]?.message?.content;
    } catch (error) {
      logger.error(`[AI ADAPTER] Call Failed:`, error);
      throw error;
    }
  }
}