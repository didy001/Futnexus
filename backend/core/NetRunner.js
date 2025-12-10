
import puppeteer from 'puppeteer';
import logger from './logger.js';
import path from 'path';
import fs from 'fs';
import { interventionManager } from './InterventionManager.js';

class NetRunner {
  constructor() {
    this.browser = null;
    this.screenshotDir = path.resolve('./workspace/screenshots');
    this.userDataDir = path.resolve('./workspace/browser_profile');
  }

  async init() {
    logger.info('[NET RUNNER] 🕸️ Initializing Headless Browser Protocol...');
    if (!fs.existsSync(this.userDataDir)) {
        fs.mkdirSync(this.userDataDir, { recursive: true });
    }
  }

  async launchBrowser(mode = 'HEADLESS') {
    if (this.browser) {
        // If requesting HEADFUL but currently HEADLESS, we must restart
        // Currently simplifed to just use existing or launch new if null
        return;
    }
    
    const headless = mode === 'HEADLESS' ? "new" : false; 
    logger.info(`[NET RUNNER] Launching Chrome Instance (Mode: ${mode})...`);

    this.browser = await puppeteer.launch({
      headless: headless,
      userDataDir: this.userDataDir, 
      args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-size=1920,1080'
      ],
      ignoreDefaultArgs: ['--enable-automation']
    });
  }

  /**
   * THE SYMBIOTE HANDOVER
   * Opens the browser, pauses script, waits for user to say "I'm done".
   */
  async handoverSession(url, instruction) {
      logger.info(`[NET RUNNER] 🤝 INITIATING HANDOVER. Operator Control Requested.`);
      
      // Must be headful
      if (this.browser) await this.close();
      await this.launchBrowser('HEADFUL');
      
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Request User Confirmation
      await interventionManager.request(
          'MANUAL_TASK', 
          `BROWSER HANDOVER: ${instruction}. Perform the action in the opened Chrome window. Click RESOLVE when finished.`,
          { url }
      );

      logger.info(`[NET RUNNER] 🤝 Operator returned control. Resuming automation.`);
      
      // Capture state after human interaction
      const content = await page.evaluate(() => document.body.innerText);
      const cookies = await page.cookies();
      
      await page.close();
      // We keep browser open or close? For safety, close and let scriptConnect reopen if needed.
      await this.close();

      return {
          success: true,
          action: "HANDOVER_COMPLETE",
          extracted_text: content.substring(0, 5000),
          cookies_count: cookies.length
      };
  }

  async scriptConnect(url, actions = {}) {
    logger.info(`[NET RUNNER] ⚡ Executing Active Connection to: ${url}`);
    
    // Check for Handover Request
    if (actions.handover) {
        return this.handoverSession(url, actions.instruction || "Manual Intervention Required");
    }

    const mode = (actions.mode === 'INTERACTIVE' || actions.login) ? 'HEADFUL' : 'HEADLESS';
    await this.launchBrowser(mode);
    const page = await this.browser.newPage();
    
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)]);
    await page.setViewport({ width: 1920, height: 1080 });

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.chrome = { runtime: {} };
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      const pageText = await page.evaluate(() => document.body.innerText);
      
      // BAN CHECK
      const banKeywords = ['Account Suspended', 'Access Denied', 'Challenge Loop'];
      if (banKeywords.some(k => pageText.includes(k))) {
          throw new Error("BAN_DETECTED");
      }

      // CAPTCHA / 2FA AUTO-HANDOVER
      if (mode === 'HEADFUL' && (pageText.includes("Captcha") || pageText.includes("Verify"))) {
          logger.warn(`[NET RUNNER] 🧩 WALL DETECTED. AUTO-HANDOVER TO OPERATOR.`);
          await interventionManager.request('MANUAL_TASK', "Please solve the Captcha/Verification in the browser.", { url });
          await page.waitForNavigation({ timeout: 60000 }).catch(() => {}); // Wait for human to nav away
      }

      if (actions.waitForSelector) await page.waitForSelector(actions.waitForSelector, { timeout: 10000 });
      if (actions.click) { await page.click(actions.click); await new Promise(r => setTimeout(r, 2000)); }
      if (actions.type) {
         for (const input of actions.type) {
             await page.type(input.selector, input.text, { delay: 100 });
         }
      }

      let screenshotPath = null;
      if (actions.screenshot) {
        const timestamp = Date.now();
        const safeName = url.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        screenshotPath = path.join(this.screenshotDir, `${safeName}_${timestamp}.png`);
        await fs.promises.mkdir(this.screenshotDir, { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: true });
      }

      const content = await page.evaluate(() => document.body.innerText);
      const title = await page.title();

      await page.close();
      if (mode === 'HEADFUL') await this.close();
      
      return {
        success: true,
        title,
        content_length: content.length,
        screenshot: screenshotPath,
        extracted_text: content.substring(0, 5000)
      };

    } catch (error) {
      logger.error(`[NET RUNNER] Connection Failed:`, error);
      if (page) await page.close();
      if (this.browser) await this.close();
      if (error.message === 'BAN_DETECTED') throw error;
      return { success: false, error: error.message };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('[NET RUNNER] Browser Terminated.');
    }
  }
}

export const netRunner = new NetRunner();
