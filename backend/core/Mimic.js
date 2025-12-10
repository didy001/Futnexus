
import { netRunner } from './NetRunner.js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';
import { interventionManager } from './InterventionManager.js'; // NEW

class Mimic {
  constructor() {
    this.activeSession = false;
  }

  async init() {
    logger.info('[MIMIC] 🎭 Protocol Initialized. Ready to emulate human behavior.');
  }

  /**
   * High-Level command to interact with ANY website using AI vision/logic.
   */
  async act(url, intent) {
    logger.info(`[MIMIC] 🎭 Targeting ${url} with intent: "${intent}" (Mode: STEALTH)`);

    try {
      const isInteractive = intent.toLowerCase().includes('login') || intent.toLowerCase().includes('setup') || intent.toLowerCase().includes('captcha');
      const mode = isInteractive ? 'HEADFUL' : 'HEADLESS';

      await netRunner.launchBrowser(mode);
      const page = await netRunner.browser.newPage();
      
      await page.setViewport({ width: 1366 + Math.floor(Math.random() * 100), height: 768 + Math.floor(Math.random() * 100) });
      
      await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          window.chrome = { runtime: {} };
      });

      logger.info(`[MIMIC] Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      await this._smartScroll(page);

      // --- SYMBIOTE PROTOCOL (2FA/OTP DETECTION) ---
      // If we see "Enter Code" or "Verify", we ask the Human.
      const pageText = await page.evaluate(() => document.body.innerText);
      const otpKeywords = ["Enter verification code", "Enter the code sent", "Two-factor authentication", "Security check"];
      
      if (otpKeywords.some(k => pageText.includes(k))) {
          logger.warn(`[MIMIC] 🔐 2FA WALL DETECTED. REQUESTING SYMBIOTE INTERVENTION.`);
          
          // Request Code from Human via Dashboard
          const otpCode = await interventionManager.request('OTP', `2FA Code required for ${url}`, { url });
          
          logger.info(`[MIMIC] 🔓 Code received from Operator: ${otpCode}. Injecting...`);
          
          // Find input (AI Logic or Heuristic)
          await page.evaluate((code) => {
              const inputs = Array.from(document.querySelectorAll('input'));
              const codeInput = inputs.find(i => i.placeholder.toLowerCase().includes('code') || i.name.includes('code') || i.type === 'number' || i.type === 'text');
              if (codeInput) {
                  codeInput.value = code;
                  codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                  codeInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
          }, otpCode);
          
          // Press Enter
          await page.keyboard.press('Enter');
          await this._humanDelay(2000, 4000);
          await page.waitForNavigation({ timeout: 60000 });
      }

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
      let plan;
      try {
          plan = JSON.parse(planRaw.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch(e) {
          plan = { steps: [] };
      }

      logger.info(`[MIMIC] 🧠 AI Plan devised: ${plan.steps?.length || 0} steps.`);

      // 4. Execute Steps with HUMAN PHYSICS
      if (plan.steps) {
          for (const step of plan.steps) {
            if (step.action === 'CLICK') {
                logger.info(`[MIMIC] Moving mouse to #${step.targetId}`);
                const el = await page.$(`[data-nexus-id="${step.targetId}"]`);
                if (el) {
                    const box = await el.boundingBox();
                    if (box) {
                        await this._humanMove(page, box.x + box.width / 2, box.y + box.height / 2);
                        await this._humanDelay(100, 300);
                        await page.mouse.down();
                        await this._humanDelay(50, 150);
                        await page.mouse.up();
                    }
                }
            } else if (step.action === 'TYPE') {
                logger.info(`[MIMIC] Typing "${step.text}"`);
                const el = await page.$(`[data-nexus-id="${step.targetId}"]`);
                if (el) {
                    await el.focus();
                    for (const char of step.text) {
                        await page.keyboard.type(char, { delay: Math.random() * 100 + 30 });
                    }
                }
            } else if (step.action === 'WAIT') {
                await this._humanDelay(step.ms || 1000, (step.ms || 1000) + 1000);
            }
            await this._humanDelay(500, 1500);
          }
      }

      const screenshotPath = await netRunner.scriptConnect(url, { screenshot: true });
      
      if (mode !== 'HEADFUL') {
          await page.close();
      } else {
          await page.close();
          await netRunner.close();
      }

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
      await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight / 2);
      });
      await this._humanDelay(1000, 2000);
  }

  async _humanMove(page, x, y) {
      const steps = 10;
      await page.mouse.move(x, y, { steps: steps + Math.floor(Math.random() * 5) });
  }
}

export const mimic = new Mimic();
