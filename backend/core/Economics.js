
import logger from './logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class Economics {
  constructor() {
    this.ledgerPath = path.resolve('./workspace/economics_ledger.json');
    this.shadow_vault = 0.0; // User's Money (Tribute)
    this.system_treasury = 0.0; // System's Money (Opex)
    this.transactions = [];
    this.valuation = {
        infrastructure_value: 0,
        intellectual_capital: 0,
        liquid_assets: 0
    };
    this.DIVIDEND_RATIO = 0.40; // 40% for the King
  }

  async init() {
    try {
        const data = await fs.readFile(this.ledgerPath, 'utf8');
        const json = JSON.parse(data);
        this.transactions = json.transactions || [];
        this.valuation = json.valuation || this.valuation;
        
        // Replay Ledger to calculate balances (Source of Truth)
        this._recalculateBalances();
        
        logger.info(`[ECONOMICS] 🏛️ Ledger Loaded. Vault: $${this.shadow_vault.toFixed(2)} | Treasury: $${this.system_treasury.toFixed(2)}`);
    } catch (e) {
        logger.info(`[ECONOMICS] 🌱 Initializing New Ledger.`);
        // Genesis Transaction
        await this.recordTransaction({
            type: 'DEPOSIT',
            amount: 5.00,
            source: 'GENESIS_SEED',
            target: 'SYSTEM_TREASURY',
            note: 'Initial Injection'
        });
    }
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

  async registerAsset(asset) {
      // Intellectual Capital calculation
      const value = (asset.complexity_score || 1) * 100;
      this.valuation.intellectual_capital += value;
      await this._save();
      logger.info(`[ECONOMICS] 🏗️ ASSET REGISTERED: ${asset.name} (Val: $${value})`);
  }

  async registerExpense(amount, reason) {
      if (this.system_treasury < amount) {
          logger.warn(`[ECONOMICS] 🛑 Insufficient Treasury Funds for: ${reason}`);
          return false;
      }
      
      await this.recordTransaction({
          type: 'EXPENSE',
          amount: amount,
          source: 'SYSTEM_TREASURY',
          target: 'EXTERNAL',
          note: reason
      });
      
      logger.info(`[ECONOMICS] 📉 EXPENSE: -$${amount} (${reason})`);
      return true;
  }

  async recordRevenue(amount, source) {
      logger.info(`[ECONOMICS] 💰 INCOMING REVENUE: $${amount} from ${source}`);

      const tribute = Number((amount * this.DIVIDEND_RATIO).toFixed(2));
      const expansion = Number((amount - tribute).toFixed(2));
      
      // 1. Pay the King
      await this.recordTransaction({
          type: 'REVENUE_SPLIT',
          amount: tribute,
          source: 'INCOMING',
          target: 'SHADOW_VAULT',
          note: `Tribute from ${source}`
      });

      // 2. Feed the System
      await this.recordTransaction({
          type: 'REVENUE_SPLIT',
          amount: expansion,
          source: 'INCOMING',
          target: 'SYSTEM_TREASURY',
          note: `Expansion capital from ${source}`
      });
      
      if (this.shadow_vault >= 50.0) await this.triggerPayout();
  }

  async triggerPayout() {
      if (this.shadow_vault <= 0) return;
      
      logger.info(`[ECONOMICS] 👑 INITIATING PAYOUT: $${this.shadow_vault}`);
      
      await this.recordTransaction({
          type: 'WITHDRAWAL',
          amount: this.shadow_vault,
          source: 'SHADOW_VAULT',
          target: 'OWNER_WALLET',
          note: 'Automatic Dividend Payout'
      });
  }

  async _save() {
      try {
        await fs.mkdir(path.dirname(this.ledgerPath), { recursive: true });
        await fs.writeFile(this.ledgerPath, JSON.stringify({
            transactions: this.transactions,
            valuation: this.valuation,
            updated_at: new Date().toISOString()
        }, null, 2));
      } catch(e) {
          logger.error("Ledger Save Failed", e);
      }
  }
  
  getStats() {
      return {
          vault: this.shadow_vault,
          treasury: this.system_treasury,
          valuation: this.valuation
      };
  }
}

export const economics = new Economics();
