
import { ethers } from 'ethers';
import logger from './logger.js';
import { aegis } from './Aegis.js';

class WalletManager {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.active = false;
  }

  async init() {
    logger.info('[WALLET MANAGER] 🪙 Initializing Crypto Core...');
    
    if (process.env.PRIVATE_KEY && process.env.RPC_URL) {
        try {
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            this.active = true;
            
            const address = await this.wallet.getAddress();
            logger.info(`[WALLET MANAGER] ✅ Wallet Active. Address: ${address}`);
        } catch (e) {
            logger.error(`[WALLET MANAGER] Failed to load wallet: ${e.message}`);
        }
    } else {
        logger.warn('[WALLET MANAGER] No Private Key/RPC found. Read-only mode.');
    }
  }

  async getBalance() {
      if (!this.active) return "0.00 (No Wallet)";
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
  }

  /**
   * Signs a transaction.
   * CRITICAL SECURITY: This method must NEVER be called directly by an agent without Kabuto's audit.
   */
  async signTransaction(txParams) {
      // 1. AEGIS: Global Policy Check (Blacklists, Sanitization)
      await aegis.governOutput('WALLET_MANAGER', 'SIGN_TX', txParams);
      
      if (!this.active) {
          logger.warn("[WALLET] Simulation Mode: Transaction signed virtually.");
          return "0xSIMULATED_SIGNATURE";
      }
      
      logger.info(`[WALLET MANAGER] ✍️ Signing & Broadcasting Transaction to ${txParams.to}`);
      
      // In production, we would use this.wallet.sendTransaction(txParams);
      // For safety in this dev environment, we simulate the broadcast
      return { 
          hash: "0xSIMULATED_HASH_" + Date.now(), 
          status: "BROADCASTED" 
      };
  }
}

export const walletManager = new WalletManager();
