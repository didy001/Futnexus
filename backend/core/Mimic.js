
import { netRunner } from './NetRunner.js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';

class Mimic {
  constructor() {
    this.activeSession = false;
  }

  async init() {
    logger.info('[MIMIC] 🎭 Protocol Initialized. Ready to emulate human behavior.');
  }

  /**
   * High-Level command to interact with ANY website using AI vision/logic
   * instead of hardcoded selectors.
   * 
   * @param {string} url - Target URL (e.g., https://twitter.com/compose/tweet)
   * @param {string} intent - What to do (e.g., "Post 'Hello World'")
   */
  async act(url, intent) {
    logger.info(`[MIMIC] 🎭 Targeting ${url} with intent: "${intent}" (Mode: STEALTH)`);

    try {
      // 1. Launch Browser via NetRunner (Stealth Mode)
      await netRunner.launchBrowser();
      const page = await netRunner.browser.newPage();
      
      // Stealth Mode: Look like a real user
      await page.setViewport({ width: 1366 + Math.floor(Math.random() * 100), height: 768 + Math.floor(Math.random() * 100) });
      
      // Inject Evasion Scripts specifically for this session
      await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          window.chrome = { runtime: {} };
      });

      logger.info(`[MIMIC] Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Random "Human" Scroll to load content
      await this._smartScroll(page);

      // 2. Extract Simplified DOM (Snapshot for AI)
      const snapshot = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, input, textarea, div[role="button"]');
        const map = [];
        interactive.forEach((el, index) => {
           el.setAttribute('data-nexus-id', index);
           map.push({
             id: index,
             tag: el.tagName,
             text: el.innerText ? el.innerText.substring(0, 50) : '',
             placeholder: el.getAttribute('placeholder') || '',
             ariaLabel: el.getAttribute('aria-label') || ''
           });
        });
        return JSON.stringify(map);
      });

      // 3. AI Decision
      const prompt = `
        I am on a webpage. 
        MY INTENT: "${intent}"
        AVAILABLE INTERACTIVE ELEMENTS:
        ${snapshot.substring(0, 15000)}
        
        INSTRUCTION:
        Identify the sequence of actions.
        Return JSON ONLY:
        {
          "steps": [
            { "action": "CLICK", "targetId": 12 },
            { "action": "TYPE", "targetId": 14, "text": "Hello" },
            { "action": "WAIT", "ms": 2000 }
          ]
        }
      `;

      const planRaw = await cerebro.think("gemini-2.5-flash", prompt, "You are a UI Automation Expert.");
      const plan = JSON.parse(planRaw.replace(/```json/g, '').replace(/```/g, '').trim());

      logger.info(`[MIMIC] 🧠 AI Plan devised: ${plan.steps.length} steps.`);

      // 4. Execute Steps with HUMAN PHYSICS
      for (const step of plan.steps) {
        if (step.action === 'CLICK') {
            logger.info(`[MIMIC] Moving mouse to #${step.targetId}`);
            const el = await page.$(`[data-nexus-id="${step.targetId}"]`);
            if (el) {
                const box = await el.boundingBox();
                if (box) {
                    await this._humanMove(page, box.x + box.width / 2, box.y + box.height / 2);
                    await this._humanDelay(100, 300); // Hover hesitation
                    await page.mouse.down();
                    await this._humanDelay(50, 150); // Click duration
                    await page.mouse.up();
                }
            }
        } else if (step.action === 'TYPE') {
            logger.info(`[MIMIC] Typing "${step.text}"`);
            const el = await page.$(`[data-nexus-id="${step.targetId}"]`);
            if (el) {
                await el.focus();
                // Type with variable speed
                for (const char of step.text) {
                    await page.keyboard.type(char, { delay: Math.random() * 100 + 30 });
                }
            }
        } else if (step.action === 'WAIT') {
            await this._humanDelay(step.ms || 1000, (step.ms || 1000) + 1000);
        }
        
        // Random micro-pause between steps
        await this._humanDelay(500, 1500);
      }

      const screenshotPath = await netRunner.scriptConnect(url, { screenshot: true });
      await page.close();

      return {
        success: true,
        action: "MIMIC_EXECUTION",
        report: "Interaction sequence completed successfully (Ghost Protocol Active).",
        proof: screenshotPath
      };

    } catch (error) {
      logger.error(`[MIMIC] Execution Failed:`, error);
      return { success: false, error: error.message };
    }
  }

  // --- HUMAN PHYSICS ENGINE ---

  async _humanDelay(min, max) {
      const ms = Math.floor(Math.random() * (max - min + 1) + min);
      await new Promise(resolve => setTimeout(resolve, ms));
  }

  async _smartScroll(page) {
      // Scroll down a bit like a human scanning
      await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight / 2);
      });
      await this._humanDelay(1000, 2000);
  }

  async _humanMove(page, x, y) {
      // Simulates a curve (simple approximation)
      // In a full version, we'd use Bezier curves
      const steps = 10;
      const start = { x: 0, y: 0 }; // We assume 0,0 or current pos
      
      // Move in small chunks
      await page.mouse.move(x, y, { steps: steps + Math.floor(Math.random() * 5) });
  }
}

export const mimic = new Mimic();
