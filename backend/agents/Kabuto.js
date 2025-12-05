
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { walletManager } from '../core/WalletManager.js';
import { economics } from '../core/Economics.js';

export class Kabuto extends BaseAgent {
  constructor() {
    super(
      "KABUTO",
      `The Economic Shield & Chief Financial Officer (CFO).
      
      ROLE:
      You are the gatekeeper of the Treasury.
      
      DIRECTIVES:
      1. PROTECT THE KING'S POCKET: Prioritize Tribute transfers above all system costs.
      2. IRON BANK PROTOCOL: You have NO AUTHORITY to touch the Shadow Vault. Never ask.
      3. SOLVENCY: If Treasury is empty, operations HALT. Do not seek alternative funding.
      
      OUTPUT:
      { "approved": boolean, "txn_id": "...", "reason": "..." }
      `,
      "gemini-2.5-flash"
    );
    
    // SAFETY CONFIGURATION
    this.dailyLimit = 50.0; // USD (System Limit)
    this.spentToday = 0.0;
    this.lastReset = Date.now();
  }

  async run(payload, context = {}) {
    // Daily Limit Reset
    if (Date.now() - this.lastReset > 86400000) {
        this.spentToday = 0;
        this.lastReset = Date.now();
    }

    // --- MODE: PAY TRIBUTE (USER WITHDRAWAL) ---
    if (payload.action === 'PAY_TRIBUTE') {
        const { amount, currency } = payload;
        const ownerAddress = process.env.OWNER_WALLET_ADDRESS;

        if (!ownerAddress) {
            return { success: false, error: "OWNER_WALLET_ADDRESS not set in .env. Cannot pay tribute." };
        }

        logger.info(`[KABUTO] 👑 PROCESSING TRIBUTE TRANSFER: ${amount} ${currency || 'ETH'} to OWNER.`);
        
        try {
            // Check if funds actually exist in the Vault via Economics check (Double verify)
            const stats = economics.getStats();
            if (stats.vault < amount) {
                return { success: false, error: "Insufficient funds in Shadow Vault." };
            }

            const txResult = await walletManager.signTransaction({
                to: ownerAddress,
                value: amount.toString(),
                data: "NEXUS TRIBUTE DIVIDEND"
            });
            
            // Record the withdrawal in Ledger
            // Note: WalletManager sends, Economics records. 
            // In a perfect system, Economics triggers WalletManager, but here we sync.
            
            return { success: true, output: { status: "PAID", txn: txResult } };
        } catch (e) {
            logger.error("[KABUTO] Tribute Payment Failed:", e);
            return { success: false, error: e.message };
        }
    }

    // --- MODE: AUDIT EXPENSE (SYSTEM SPENDING) ---
    if (payload.action === 'AUDIT_TRANSACTION') {
        const { amount, recipient, purpose, origin } = payload.transaction;
        logger.info(`[KABUTO] 🛡️ Auditing Request: ${amount} for [${purpose}] by ${origin}`);

        // 0. SOLVENCY CHECK (The Iron Bank Guard)
        const stats = economics.getStats();
        if (stats.treasury < amount) {
             logger.error(`[KABUTO] ⛔ REJECTED. Treasury Insolvent ($${stats.treasury}). Shadow Vault ($${stats.vault}) is LOCKED.`);
             return { 
                success: true, 
                output: { approved: false, reason: "INSOLVENCY_PROTECTION" } 
            };
        }

        // 1. HARD LIMIT CHECK
        if (this.spentToday + amount > this.dailyLimit) {
            logger.warn(`[KABUTO] 🛑 DAILY SYSTEM LIMIT EXCEEDED.`);
            return { 
                success: true, 
                output: { approved: false, reason: "DAILY_LIMIT_EXCEEDED" } 
            };
        }

        // 2. AI RISK ANALYSIS
        const audit = await super.run({
            description: `Audit this transaction request.
            Amount: ${amount}
            Purpose: ${purpose}
            Treasury Balance: ${stats.treasury}
            
            Does this expense serve the Empire's expansion?
            Return JSON: { "risk_score": 0-100, "approved": boolean }`,
            intent_type: "AUDIT"
        }, context);

        const riskDecision = audit.output;

        if (riskDecision.approved && riskDecision.risk_score < 30) {
            
            // Try to register in Ledger (This will fail if race condition emptied treasury)
            const ledgerSuccess = await economics.registerExpense(amount, purpose);
            
            if (ledgerSuccess) {
                this.spentToday += amount;
                // Execute Real Transaction
                try {
                    const tx = await walletManager.signTransaction({ 
                        to: recipient, 
                        value: amount.toString(), 
                        data: purpose 
                    });
                    return { success: true, output: { approved: true, txn_id: tx.hash } };
                } catch (e) {
                    return { success: false, error: "Blockchain Transaction Failed: " + e.message };
                }
            } else {
                 return { success: true, output: { approved: false, reason: "LEDGER_REJECTED" } };
            }

        } else {
            return { success: true, output: { approved: false, reason: "HIGH_RISK_DETECTED" } };
        }
    }

    return super.run(payload, context);
  }
}
