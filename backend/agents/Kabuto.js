
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
      2. AUDIT SPENDING: High ROI required for all system expenses.
      3. LIQUIDITY: Ensure we never run out of gas for critical ops.
      
      OUTPUT:
      { "approved": boolean, "txn_id": "...", "reason": "..." }
      `,
      "gemini-2.5-flash"
    );
    
    // SAFETY CONFIGURATION
    this.dailyLimit = 50.0; // USD (System Limit, not Owner Payout limit)
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
        logger.info(`[KABUTO] 👑 PROCESSING TRIBUTE TRANSFER: $${amount} to OWNER.`);
        
        // This bypasses the daily limit because it is a withdrawal, not an expense
        const txResult = await walletManager.signTransaction({
            to: process.env.OWNER_WALLET_ADDRESS || "0x_OWNER_WALLET_MISSING",
            value: amount,
            data: "NEXUS TRIBUTE DIVIDEND"
        });
        
        return { success: true, output: { status: "PAID", txn: txResult } };
    }

    // --- MODE: AUDIT EXPENSE (SYSTEM SPENDING) ---
    if (payload.action === 'AUDIT_TRANSACTION') {
        const { amount, recipient, purpose, origin } = payload.transaction;
        logger.info(`[KABUTO] 🛡️ Auditing Request: $${amount} for [${purpose}] by ${origin}`);

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
            
            Does this expense serve the Empire's expansion?
            Return JSON: { "risk_score": 0-100, "approved": boolean }`,
            intent_type: "AUDIT"
        }, context);

        const riskDecision = audit.output;

        if (riskDecision.approved && riskDecision.risk_score < 30) {
            this.spentToday += amount;
            
            // Register in Ledger
            await economics.registerExpense(amount, purpose);
            
            // Execute
            await walletManager.signTransaction({ to: recipient, value: amount, data: purpose });

            return { 
                success: true, 
                output: { approved: true, txn_id: "0xSIM_" + Date.now() } 
            };
        } else {
            return { success: true, output: { approved: false, reason: "HIGH_RISK_DETECTED" } };
        }
    }

    return super.run(payload, context);
  }
}
