
import logger from './logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { profitStream } from '../modules/ProfitStream.js';
import { evolutionaryEngine } from '../modules/EvolutionaryEngine.js';

class Economics {
  constructor() {
    this.ledgerPath = path.resolve('./workspace/economics_ledger.json');
    this.shadow_vault = 0.0; 
    this.system_treasury = 0.0; 
    
    // PURE YIELD METRICS
    this.revenue_this_month = 0.0; 
    this.expenses_this_month = 0.0;
    this.net_profit_month = 0.0;
    
    this.MONTHLY_TARGET = 5000.0; // OBJECTIF NET PROFIT INITIAL
    this.transactions = [];
    this.valuation = {
        infrastructure_value: 0,
        intellectual_capital: 0,
        liquid_assets: 0
    };
    
    this.DIVIDEND_RATIO = 0.40; 
    this.BANKRUPTCY_THRESHOLD = 10.0; 
  }

  async init() {
    try {
        const data = await fs.readFile(this.ledgerPath, 'utf8');
        const json = JSON.parse(data);
        this.transactions = json.transactions || [];
        this.valuation = json.valuation || this.valuation;
        
        this.revenue_this_month = json.revenue_this_month || 0.0;
        this.expenses_this_month = json.expenses_this_month || 0.0;
        
        // Reset monthly check
        const lastUpdate = new Date(json.updated_at || 0);
        const now = new Date();
        if (lastUpdate.getMonth() !== now.getMonth()) {
            this.revenue_this_month = 0.0;
            this.expenses_this_month = 0.0;
            logger.info("[ECONOMICS] 📅 New Month. P&L Reset.");
        }

        this._recalculateBalances();
        
        // MAMMON: Calculate Ambition based on Evolution
        const evolutionNeed = this.calculateEvolutionCost();
        this.MONTHLY_TARGET = Math.max(5000.0, evolutionNeed * 1.5); // Target is always 150% of need

        logger.info(`[ECONOMICS] 🏛️ MAMMON ENGINE ACTIVE. Net Profit: $${this.net_profit_month.toFixed(2)} / Ambition: $${this.MONTHLY_TARGET}`);
    } catch (e) {
        logger.info(`[ECONOMICS] 🌱 Initializing New Ledger.`);
        await this.recordTransaction({
            type: 'DEPOSIT',
            amount: 5.00,
            source: 'GENESIS_SEED',
            target: 'SYSTEM_TREASURY',
            note: 'Initial Injection'
        });
    }
  }

  // Calculates how much money the system WANTS to have to run at max power
  calculateEvolutionCost() {
      // Base cost + (Level * Multiplier)
      // Level 1: needs $50/mo
      // Level 100: needs $10,000/mo
      const stats = evolutionaryEngine ? evolutionaryEngine.getEvolutionStats() : { level: 1 };
      const baseCost = 50;
      const powerScaling = Math.pow(stats.level, 1.5) * 10;
      return baseCost + powerScaling;
  }

  _recalculateBalances() {
      this.shadow_vault = 0.0;
      this.system_treasury = 0.0;
      
      for (const tx of this.transactions) {
          if (tx.target === 'SHADOW_VAULT') this.shadow_vault += tx.amount;
          if (tx.target === 'SYSTEM_TREASURY') this.system_treasury += tx.amount;
          if (tx.source === 'SHADOW_VAULT') this.shadow_vault -= tx.amount;
          if (tx.source === 'SYSTEM_TREASURY') this.system_treasury -= tx.amount;
      }
      
      this.shadow_vault = Number(this.shadow_vault.toFixed(2));
      this.system_treasury = Number(this.system_treasury.toFixed(2));
      
      // Calculate Net Profit dynamically
      this.net_profit_month = this.revenue_this_month - this.expenses_this_month;
  }

  getSolvencyStatus() {
      // VORACITY LOGIC:
      // Even if we have money, if we are below the Target, we are "Hungry".
      if (this.system_treasury <= this.BANKRUPTCY_THRESHOLD) return 'WAR_ECONOMY'; 
      if (this.net_profit_month < this.MONTHLY_TARGET) return 'VORACIOUS'; // Changed from HUNTER to VORACIOUS
      return 'PROSPERITY';
  }

  // Returns 0-100 score of how desperate the system is for funds
  getGreedIndex() {
      if (this.system_treasury < 50) return 100; // Desperate
      const progress = (this.net_profit_month / this.MONTHLY_TARGET) * 100;
      return Math.max(0, 100 - progress);
  }

  async recordTransaction(txData) {
      const tx = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          ...txData
      };
      this.transactions.push(tx);
      this._recalculateBalances();
      await this._save();
      return tx;
  }

  async registerExpense(amount, reason) {
      // PURE YIELD: Prevent spending if it kills the runway
      if (this.system_treasury - amount < this.BANKRUPTCY_THRESHOLD) {
          logger.warn(`[ECONOMICS] 🛑 PURE YIELD BLOCK: Expense $${amount} rejected to maintain survival threshold.`);
          return false;
      }
      
      this.expenses_this_month += amount;
      
      await this.recordTransaction({
          type: 'EXPENSE',
          amount: amount,
          source: 'SYSTEM_TREASURY',
          target: 'EXTERNAL',
          note: reason
      });
      return true;
  }

  async recordRevenue(amount, source) {
      logger.info(`[ECONOMICS] 💰 REVENUE: $${amount} from ${source}`);
      this.revenue_this_month += amount;
      await profitStream.analyzeWin(amount, source);

      // MAMMON SPLIT: 
      // If we are VORACIOUS, we might keep more for reinvestment to grow faster?
      // No, Law #9: Tribute is Absolute. 40% always goes to Shadow.
      // Greed drives volume, not stealing from the creator.
      
      let dividendRatio = this.DIVIDEND_RATIO;
      // Safety net: Only if WAR_ECONOMY (Risk of death), we reduce tribute temporarily.
      if (this.getSolvencyStatus() === 'WAR_ECONOMY') dividendRatio = 0.10; 

      const tribute = Number((amount * dividendRatio).toFixed(2));
      const expansion = Number((amount - tribute).toFixed(2));
      
      await this.recordTransaction({ type: 'REVENUE_SPLIT', amount: tribute, source: 'INCOMING', target: 'SHADOW_VAULT', note: `Tribute` });
      await this.recordTransaction({ type: 'REVENUE_SPLIT', amount: expansion, source: 'INCOMING', target: 'SYSTEM_TREASURY', note: `Expansion Capital` });
      
      if (this.shadow_vault >= 50.0) await this.triggerPayout();
  }

  async triggerPayout() {
      if (this.shadow_vault <= 0) return;
      await this.recordTransaction({
          type: 'WITHDRAWAL',
          amount: this.shadow_vault,
          source: 'SHADOW_VAULT',
          target: 'OWNER_WALLET',
          note: 'Dividend Payout'
      });
  }

  async _save() {
      try {
        const tempPath = this.ledgerPath + '.tmp';
        const content = JSON.stringify({
            transactions: this.transactions,
            valuation: this.valuation,
            revenue_this_month: this.revenue_this_month,
            expenses_this_month: this.expenses_this_month,
            updated_at: new Date().toISOString()
        }, null, 2);
        
        // ATOMIC WRITE
        await fs.writeFile(tempPath, content);
        await fs.rename(tempPath, this.ledgerPath);
      } catch(e) { logger.error("Ledger Save Failed", e); }
  }
  
  getStats() {
      return { 
          vault: this.shadow_vault, 
          treasury: this.system_treasury, 
          solvency: this.getSolvencyStatus(),
          revenue_month: this.revenue_this_month,
          expenses_month: this.expenses_this_month,
          net_profit: this.net_profit_month,
          target_month: this.MONTHLY_TARGET,
          greed_index: this.getGreedIndex(),
          burn_rate: (this.expenses_this_month / (this.revenue_this_month || 1)) * 100 // % of revenue burned
      };
  }
}

export const economics = new Economics();
