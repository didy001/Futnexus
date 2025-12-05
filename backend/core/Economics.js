
import logger from './logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class Economics {
  constructor() {
    this.ledgerPath = path.resolve('./workspace/economics_ledger.json');
    this.shadow_vault = 0.0; // User's Money (Tribute) - SACROSANCT
    this.system_treasury = 0.0; // System's Money (Opex) - EXPENDABLE
    this.transactions = [];
    this.valuation = {
        infrastructure_value: 0,
        intellectual_capital: 0,
        liquid_assets: 0
    };
    this.DIVIDEND_RATIO = 0.40; // 40% for the King
    this.BANKRUPTCY_THRESHOLD = 2.0; // Under $2, we panic
  }

  async init() {
    try {
        const data = await fs.readFile(this.ledgerPath, 'utf8');
        const json = JSON.parse(data);
        this.transactions = json.transactions || [];
        this.valuation = json.valuation || this.valuation;
        this._recalculateBalances();
        logger.info(`[ECONOMICS] 🏛️ Ledger Loaded. Vault: $${this.shadow_vault.toFixed(2)} | Treasury: $${this.system_treasury.toFixed(2)}`);
    } catch (e) {
        logger.info(`[ECONOMICS] 🌱 Initializing New Ledger.`);
        // Genesis Seed to prevent immediate panic loop on fresh install
        await this.recordTransaction({
            type: 'DEPOSIT',
            amount: 5.00,
            source: 'GENESIS_SEED',
            target: 'SYSTEM_TREASURY',
            note: 'Initial Injection for Operations'
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
      this.shadow_vault = Number(this.shadow_vault.toFixed(2));
      this.system_treasury = Number(this.system_treasury.toFixed(2));
  }

  getSolvencyStatus() {
      if (this.system_treasury <= this.BANKRUPTCY_THRESHOLD) {
          return 'WAR_ECONOMY'; // Panic Mode
      }
      if (this.system_treasury < 10.0) {
          return 'CAUTION';
      }
      return 'PROSPERITY';
  }

  async recordTransaction(txData) {
      if (txData.source === 'SHADOW_VAULT' && txData.type !== 'WITHDRAWAL') {
          throw new Error("IRON BANK PROTOCOL: ACCESS DENIED. The Shadow Vault is for Tribute only.");
      }

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
      const value = (asset.complexity_score || 1) * 100;
      this.valuation.intellectual_capital += value;
      await this._save();
      logger.info(`[ECONOMICS] 🏗️ ASSET REGISTERED: ${asset.name} (Val: $${value})`);
  }

  async registerExpense(amount, reason) {
      // WAR ECONOMY CHECK
      if (this.getSolvencyStatus() === 'WAR_ECONOMY') {
          // In War Economy, only Asset Generation expenses are allowed (investing to survive)
          if (!reason.includes('ASSET_GEN') && !reason.includes('SURVIVAL')) {
              logger.warn(`[ECONOMICS] 🛡️ WAR ECONOMY BLOCK: Rejected expense $${amount} for ${reason}.`);
              return false;
          }
      }

      if (this.system_treasury < amount) {
          logger.warn(`[ECONOMICS] 🛑 INSOLVENCY. Treasury ($${this.system_treasury}) < Cost ($${amount}).`);
          return false;
      }
      
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
      logger.info(`[ECONOMICS] 💰 INCOMING REVENUE: $${amount} from ${source}`);
      
      // In War Economy, the System takes a bigger cut to survive
      let dividendRatio = this.DIVIDEND_RATIO;
      if (this.getSolvencyStatus() === 'WAR_ECONOMY') {
          dividendRatio = 0.10; // King takes less temporarily to save the Kingdom
          logger.info(`[ECONOMICS] 🛡️ WAR ECONOMY: Tribute reduced to 10% to refuel Treasury.`);
      }

      const tribute = Number((amount * dividendRatio).toFixed(2));
      const expansion = Number((amount - tribute).toFixed(2));
      
      await this.recordTransaction({ type: 'REVENUE_SPLIT', amount: tribute, source: 'INCOMING', target: 'SHADOW_VAULT', note: `Tribute from ${source}` });
      await this.recordTransaction({ type: 'REVENUE_SPLIT', amount: expansion, source: 'INCOMING', target: 'SYSTEM_TREASURY', note: `Opex from ${source}` });
      
      if (this.shadow_vault >= 50.0) await this.triggerPayout();
  }

  async triggerPayout() {
      if (this.shadow_vault <= 0) return;
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
      } catch(e) { logger.error("Ledger Save Failed", e); }
  }
  
  getStats() {
      return { vault: this.shadow_vault, treasury: this.system_treasury, valuation: this.valuation, solvency: this.getSolvencyStatus() };
  }
}

export const economics = new Economics();
