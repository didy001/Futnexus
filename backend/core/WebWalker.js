
import logger from './logger.js';
import { aegis } from './Aegis.js';

class WebWalker {
  /**
   * Fetches a real URL and returns stripped text content.
   * Protected by AEGIS.
   */
  async readPage(url) {
    logger.info(`[WEB WALKER] 🕸️ Crawling target: ${url}`);
    
    try {
      // 1. AEGIS: Output Check (Are we allowed to visit this?)
      await aegis.governOutput('WEB_WALKER', 'HTTP_GET', { url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Nexus-Omega-Bot/1.0 (Autonomous Research Agent)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const html = await response.text();
      
      // 2. AEGIS: Input Sanitization (Is the page attacking us?)
      await aegis.sanitizeInput(url, html.substring(0, 1000)); // Scan header/first part for injection

      const textContent = html
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "") 
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")   
        .replace(/<[^>]+>/g, ' ')                              
        .replace(/\s+/g, ' ')                                  
        .trim()
        .substring(0, 10000); 

      logger.info(`[WEB WALKER] ✅ Successfully extracted ${textContent.length} chars.`);
      return textContent;

    } catch (error) {
      logger.error(`[WEB WALKER] ❌ Crawl Failed:`, error);
      return `[ERROR ACCESSING WEB] Could not read ${url}. Reason: ${error.message}`;
    }
  }
}

export const webWalker = new WebWalker();
