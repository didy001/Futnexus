
import { BaseAgent } from './BaseAgent.js';
import { webWalker } from '../core/WebWalker.js';
import { netRunner } from '../core/NetRunner.js';
import logger from '../core/logger.js';

export class Lucifer extends BaseAgent {
  constructor() {
    super(
      "LUCIFER",
      `The Light Bringer / Research Engine.
      
      CAPABILITY UPGRADE (OMEGA): 
      - WEB_WALKER (Fast, Static Reading)
      - NET_RUNNER (Headless Browser, Screenshots, Interaction)
      - ANALYZE_AESTHETICS (Visual Intelligence)
      
      YOUR ROLE:
      1. Analyze the intent.
      2. If it's simple reading -> Use WEB_WALKER.
      3. If it requires login, screenshot, or complex JS -> Use NET_RUNNER.
      4. If it asks for Design Inspiration -> Use ANALYZE_AESTHETICS.
      
      OUTPUT JSON:
      {
        "knowledge_found": boolean,
        "source_url": "string",
        "method": "WALKER" | "RUNNER",
        "screenshot_path": "string (optional)",
        "extracted_summary": "string"
      }`,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- OMEGA: VISUAL INTELLIGENCE ---
    if (payload.action === 'ANALYZE_AESTHETICS') {
        const targetUrl = payload.target_url;
        logger.info(`[LUCIFER] 🎨 Analyzing Visual DNA of: ${targetUrl}`);
        
        // 1. Get Visual Proof
        const scan = await netRunner.scriptConnect(targetUrl, { screenshot: true });
        
        if (!scan.success) return { success: false, error: "Failed to visualize target." };

        // 2. Analyze (Simulated Visual processing via LLM text extraction context)
        // In a multimodal setup, we would send the image. Here we use DOM structure.
        payload.specialized_instruction = `
            TASK: Reverse-Engineer the Design System of this page.
            CONTENT DUMP: ${scan.extracted_text.substring(0, 2000)}...
            
            INSTRUCTION:
            Based on the CSS classes and text structure, deduce:
            1. Color Vibe (Dark/Light, Neon/Corporate?)
            2. Typography (Serif/Sans? Modern/Classic?)
            3. Layout Structure (Grid/Hero?)
            
            OUTPUT JSON:
            {
                "vibe": "...",
                "suspected_colors": ["..."],
                "layout_type": "..."
            }
        `;
    }

    // 1. Detect URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = payload.description.match(urlRegex);

    if (urls && urls.length > 0) {
        const targetUrl = urls[0];
        
        // Check for "Interactive" triggers in the prompt
        const interactiveTriggers = ['screenshot', 'login', 'click', 'app', 'interactive', 'visual'];
        const needsInteraction = interactiveTriggers.some(t => payload.description.toLowerCase().includes(t));

        if (needsInteraction) {
            logger.info(`[LUCIFER] ⚡ Interactive Mode detected. Engaging NetRunner on: ${targetUrl}`);
            const result = await netRunner.scriptConnect(targetUrl, {
                screenshot: true, // Default to visual proof for interactive tasks
                // In a real scenario, we would parse payload to find click/type targets
            });
            
            if (result.success) {
                payload.web_content_dump = result.extracted_text;
                context.visual_proof = result.screenshot;
                logger.info(`[LUCIFER] NetRunner mission complete. Screenshot: ${result.screenshot}`);
            }
        } else {
            logger.info(`[LUCIFER] 🌐 Static Mode. Using WebWalker on: ${targetUrl}`);
            const pageContent = await webWalker.readPage(targetUrl);
            payload.web_content_dump = pageContent;
        }
    }

    return super.run(payload, context);
  }
}
