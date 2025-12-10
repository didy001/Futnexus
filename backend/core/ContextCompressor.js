
import logger from './logger.js';

/**
 * CONTEXT COMPRESSOR (The Zip Algorithm)
 * Prevents "Context Window Exceeded" errors by aggressively summarizing data
 * before sending it to the Brain.
 */
class ContextCompressor {
  constructor() {
    this.maxContextLength = 3000; // Char limit for "Context" part of prompt
  }

  /**
   * Compresses an object or string to fit within limits.
   */
  compress(input) {
    if (!input) return "";
    
    let text = typeof input === 'string' ? input : JSON.stringify(input);
    
    if (text.length <= this.maxContextLength) {
        return text;
    }

    logger.warn(`[COMPRESSOR] 📉 Input too large (${text.length} chars). Compressing...`);

    // STRATEGY 1: JSON Pruning (If it looks like JSON)
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try {
            const obj = JSON.parse(text);
            const pruned = this._pruneObject(obj);
            text = JSON.stringify(pruned);
            if (text.length <= this.maxContextLength) return text;
        } catch (e) {
            // Not valid JSON, fallthrough
        }
    }

    // STRATEGY 2: Middle-Out Truncation (Preserve Start/End)
    const keep = this.maxContextLength / 2;
    return text.substring(0, keep) + "\n...[DATA COMPRESSED]...\n" + text.substring(text.length - keep);
  }

  _pruneObject(obj, depth = 0) {
      if (depth > 2) return "[OMITTED]"; // Depth limit
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
          // Keep first 3 items only
          if (obj.length > 3) {
              return [...obj.slice(0, 3).map(i => this._pruneObject(i, depth + 1)), `...(${obj.length - 3} more)`];
          }
          return obj.map(i => this._pruneObject(i, depth + 1));
      }

      const newObj = {};
      let keys = Object.keys(obj);
      // Limit number of keys
      if (keys.length > 10) keys = keys.slice(0, 10);

      for (const key of keys) {
          // Skip huge fields likely to contain dumps
          if (key.includes('content') || key.includes('dump') || key.includes('html')) {
              const val = obj[key];
              if (typeof val === 'string' && val.length > 200) {
                  newObj[key] = val.substring(0, 200) + "...[TRUNCATED]";
                  continue;
              }
          }
          newObj[key] = this._pruneObject(obj[key], depth + 1);
      }
      return newObj;
  }
}

export const contextCompressor = new ContextCompressor();
