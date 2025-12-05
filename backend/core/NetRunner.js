
import puppeteer from 'puppeteer';
import logger from './logger.js';
import path from 'path';
import fs from 'fs';

class NetRunner {
  constructor() {
    this.browser = null;
    this.screenshotDir = path.resolve('./workspace/screenshots');
    this.userDataDir = path.resolve('./workspace/browser_profile'); // Persistent Memory
  }

  async init() {
    logger.info('[NET RUNNER] 🕸️ Initializing Headless Browser Protocol...');
    if (!fs.existsSync(this.userDataDir)) {
        fs.mkdirSync(this.userDataDir, { recursive: true });
    }
  }

  async launchBrowser() {
    if (this.browser) return;
    
    // Launch with persistent user data dir to keep cookies/sessions alive
    // STEALTH ARGUMENTS ADDED
    this.browser = await puppeteer.launch({
      headless: "new",
      userDataDir: this.userDataDir, 
      args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled', // CRITICAL: Hides "Chrome is being controlled..."
          '--disable-infobars',
          '--window-size=1920,1080'
      ],
      ignoreDefaultArgs: ['--enable-automation'] // Hides automation flag
    });
    logger.info('[NET RUNNER] Chrome Instance Launched (Stealth Identity).');
  }

  /**
   * Connects to a URL, interacts, and returns data or a screenshot.
   */
  async scriptConnect(url, actions = {}) {
    logger.info(`[NET RUNNER] ⚡ Executing Active Connection to: ${url}`);
    
    await this.launchBrowser();
    const page = await this.browser.newPage();
    
    // EVASION: Randomize User Agent
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)]);
    await page.setViewport({ width: 1920, height: 1080 });

    // EVASION: Mask Webdriver property
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // --- INTERACTION SCRIPTING ---
      if (actions.waitForSelector) {
        await page.waitForSelector(actions.waitForSelector, { timeout: 10000 });
      }

      if (actions.click) {
        await page.click(actions.click);
        await new Promise(r => setTimeout(r, 2000));
      }

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
        
        const fsPromises = await import('fs/promises');
        await fsPromises.mkdir(this.screenshotDir, { recursive: true });

        await page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info(`[NET RUNNER] 📸 Visual Proof Saved: ${screenshotPath}`);
      }

      const content = await page.evaluate(() => document.body.innerText);
      const title = await page.title();

      await page.close();
      
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
