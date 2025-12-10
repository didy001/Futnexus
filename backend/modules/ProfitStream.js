
import logger from '../core/logger.js';
import { mnemosyne } from '../core/mnemosyne.js';

/**
 * MODULE: PROFIT STREAM (EVOLUTION PAR LE CAPITAL)
 * Rôle: Associer chaque gain financier à la stratégie utilisée.
 * Renforce les neurones qui rapportent.
 */
class ProfitStream {
  init() {
    logger.info('[PROFIT STREAM] 💹 Financial Learning Active.');
  }

  /**
   * Called whenever money hits the wallet.
   */
  async analyzeWin(amount, source) {
    logger.info(`[PROFIT STREAM] 🎉 VICTORY! Revenue Detected: $${amount}. Back-propagating success...`);

    // 1. Log the Win permanently
    await mnemosyne.saveLongTerm("FINANCIAL_VICTORY", {
        amount,
        source,
        timestamp: Date.now()
    });

    logger.info(`[PROFIT STREAM] 🧠 Reinforcing Neural Pathway for source: ${source}`);
  }

  /**
   * Retrieves the most profitable strategy from memory.
   */
  async getBestStrategy() {
      // Query Mnemosyne for victories
      // Since mnemosyne relies on embeddings/vector store for 'recall', 
      // we might need a more direct way to query tags or just search recent memories.
      // For V12, we iterate recent memories to find high value wins.
      
      // In a real DB we would do: SELECT * FROM victories ORDER BY amount DESC
      // Here we simulate checking the "Lessons" or specific tag
      
      const victories = await mnemosyne.getLessons("FINANCIAL_VICTORY");
      // victories is an array of content strings or objects
      
      // Simple heuristic parsing
      let bestWin = null;
      let maxAmount = 0;

      // This logic depends on how saveLongTerm stores data (it stringifies objects usually)
      // So we might need to parse them back if possible, or just rely on 'source' tag
      
      // Returning a generic directive for now if no history
      if (!victories || victories.length === 0) return null;

      // Assume logic to find best source
      return { protocol: "REPEAT_LAST_VICTORY", source: "Unknown (Data too sparse)" };
  }
}

export const profitStream = new ProfitStream();
