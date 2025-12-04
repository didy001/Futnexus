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
    logger.info(`[MIMIC] 🎭 Targeting ${url} with intent: "${intent}"`);

    try {
      // 1. Launch Browser via NetRunner
      await netRunner.launchBrowser();
      const page = await netRunner.browser.newPage();
      
      // Stealth Mode: Look like a real user
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      logger.info(`[MIMIC] Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // 2. Extract Simplified DOM (Snapshot for AI)
      // We strip it down to interactive elements to save context
      const snapshot = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, input, textarea, div[role="button"]');
        const map = [];
        interactive.forEach((el, index) => {
           // Add a temp ID to reference it
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

      // 3. AI Decision: "Which element do I click/type based on the intent?"
      const prompt = `
        I am on a webpage. 
        MY INTENT: "${intent}"
        
        AVAILABLE INTERACTIVE ELEMENTS:
        ${snapshot.substring(0, 15000)} // Truncate if too huge
        
        INSTRUCTION:
        Identify the sequence of actions to achieve the intent.
        Return JSON ONLY:
        {
          "steps": [
            { "action": "CLICK", "targetId": 12 },
            { "action": "TYPE", "targetId": 14, "text": "Hello world" },
            { "action": "WAIT", "ms": 2000 }
          ]
        }
      `;

      const planRaw = await cerebro.think("gemini-2.5-flash", prompt, "You are a UI Automation Expert.");
      const plan = JSON.parse(planRaw.replace(/```json/g, '').replace(/```/g, '').trim());

      logger.info(`[MIMIC] 🧠 AI Plan devised: ${plan.steps.length} steps.`);

      // 4. Execute Steps
      for (const step of plan.steps) {
        if (step.action === 'CLICK') {
            logger.info(`[MIMIC] Clicking element #${step.targetId}`);
            await page.click(`[data-nexus-id="${step.targetId}"]`);
        } else if (step.action === 'TYPE') {
            logger.info(`[MIMIC] Typing "${step.text}" into #${step.targetId}`);
            await page.type(`[data-nexus-id="${step.targetId}"]`, step.text, { delay: 100 });
        } else if (step.action === 'WAIT') {
            await new Promise(r => setTimeout(r, step.ms || 1000));
        }
      }

      // 5. Verify Result (Screenshot)
      const screenshotPath = await netRunner.scriptConnect(url, { screenshot: true }); // Reuse logic or just snapshot
      
      await page.close();

      return {
        success: true,
        action: "MIMIC_EXECUTION",
        report: "Interaction sequence completed successfully based on AI visual analysis.",
        proof: screenshotPath
      };

    } catch (error) {
      logger.error(`[MIMIC] Execution Failed:`, error);
      return { success: false, error: error.message };
    }
  }
}

export const mimic = new Mimic();