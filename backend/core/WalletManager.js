
import { ethers } from 'ethers';
import logger from './logger.js';
import { aegis } from './Aegis.js';

class WalletManager {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.active = false;
    this.networkName = "UNKNOWN";
  }

  async init() {
    logger.info('[WALLET MANAGER] 🪙 Initializing Crypto Core (REAL MODE)...');
    
    if (process.env.PRIVATE_KEY && process.env.RPC_URL) {
        try {
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            
            // Get Network Info
            const network = await this.provider.getNetwork();
            this.networkName = network.name;

            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            this.active = true;
            
            const address = await this.wallet.getAddress();
            const balance = await this.provider.getBalance(address);
            
            logger.info(`[WALLET MANAGER] ✅ LIVE on ${this.networkName} (Chain ID: ${network.chainId})`);
            logger.info(`[WALLET MANAGER] 🔑 Operator: ${address}`);
            logger.info(`[WALLET MANAGER] 💰 Balance: ${ethers.formatEther(balance)} ETH/MATIC`);

        } catch (e) {
            logger.error(`[WALLET MANAGER] ❌ Failed to load wallet: ${e.message}`);
        }
    } else {
        logger.warn('[WALLET MANAGER] ⚠️ No Private Key/RPC found. Wallet is OFFLINE.');
    }
  }

  async getBalance() {
      if (!this.active) return "0.00 (Offline)";
      try {
          const balance = await this.provider.getBalance(this.wallet.address);
          return ethers.formatEther(balance);
      } catch (e) {
          return "Error";
      }
  }

  /**
   * Signs and BROADCASTS a REAL transaction.
   * CRITICAL: This moves real assets. Kabuto must have audited this.
   * @param {Object} txParams - { to, value (in ETH string), data (optional string) }
   */
  async signTransaction(txParams) {
      // 1. AEGIS: Global Policy Check
      await aegis.governOutput('WALLET_MANAGER', 'SIGN_TX_REAL', txParams);
      
      if (!this.active) {
          throw new Error("Wallet is OFFLINE. Cannot execute transaction.");
      }
      
      logger.info(`[WALLET MANAGER] 🚨 INITIATING REAL TRANSACTION to ${txParams.to}`);

      try {
          // 2. Prepare Transaction
          const txRequest = {
              to: txParams.to,
          };

          // Convert "0.5" string to Wei (BigInt)
          if (txParams.value) {
              txRequest.value = ethers.parseEther(txParams.value.toString());
              logger.info(`[WALLET] 💸 Value: ${txParams.value} (${txRequest.value} wei)`);
          }

          // Handle Data (Utf8 -> Hex)
          if (txParams.data) {
              txRequest.data = ethers.hexlify(ethers.toUtf8Bytes(txParams.data));
          }

          // 3. BROADCAST TO BLOCKCHAIN
          const txResponse = await this.wallet.sendTransaction(txRequest);
          
          logger.info(`[WALLET MANAGER] 🚀 TX SENT! Hash: ${txResponse.hash}`);
          logger.info(`[WALLET MANAGER] ⏳ Waiting for confirmation...`);
          
          // Optional: Wait for 1 confirmation to ensure it didn't revert immediately
          // await txResponse.wait(1); 
          
          return { 
              hash: txResponse.hash, 
              status: "BROADCASTED_REAL",
              from: this.wallet.address,
              to: txParams.to,
              value: txParams.value,
              network: this.networkName
          };

      } catch (error) {
          logger.error(`[WALLET MANAGER] 💥 TRANSACTION FAILED: ${error.message}`);
          
          if (error.code === 'INSUFFICIENT_FUNDS') {
              logger.error(`[WALLET] FATAL: Not enough gas/funds.`);
          }
          
          throw error;
      }
  }
}

export const walletManager = new WalletManager();
