
import { ethers } from 'ethers';
import logger from './logger.js';
import { aegis } from './Aegis.js';
import { economics } from './Economics.js';

class WalletManager {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.active = false;
    this.networkName = "UNKNOWN";
    this.lastBlockChecked = 0;
    this.processedTx = new Set();
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
            this.lastBlockChecked = await this.provider.getBlockNumber();
            
            const address = await this.wallet.getAddress();
            const balance = await this.provider.getBalance(address);
            
            logger.info(`[WALLET MANAGER] ✅ LIVE on ${this.networkName} (Chain ID: ${network.chainId})`);
            logger.info(`[WALLET MANAGER] 🔑 Operator: ${address}`);
            logger.info(`[WALLET MANAGER] 💰 Balance: ${ethers.formatEther(balance)} ETH/MATIC`);

            // Start Listening for Money
            this.startIncomeScanner();

        } catch (e) {
            logger.error(`[WALLET MANAGER] ❌ Failed to load wallet: ${e.message}`);
        }
    } else {
        logger.warn('[WALLET MANAGER] ⚠️ No Private Key/RPC found. Wallet is OFFLINE.');
    }
  }

  /**
   * THE WATCHTOWER: Scans every new block for incoming money.
   */
  startIncomeScanner() {
      if (!this.active) return;
      logger.info("[WALLET MANAGER] 🦅 Income Scanner Activated. Watching for deposits...");

      this.provider.on('block', async (blockNumber) => {
          try {
              // Only scan if we moved forward
              if (blockNumber <= this.lastBlockChecked) return;
              this.lastBlockChecked = blockNumber;

              const block = await this.provider.getBlock(blockNumber, true); // true = include transactions
              if (!block || !block.prefetchedTransactions) return;

              const myAddress = this.wallet.address.toLowerCase();

              for (const tx of block.prefetchedTransactions) {
                  if (tx.to && tx.to.toLowerCase() === myAddress) {
                      // WE GOT PAID!
                      if (this.processedTx.has(tx.hash)) continue;
                      this.processedTx.add(tx.hash);

                      const amount = parseFloat(ethers.formatEther(tx.value));
                      const sender = tx.from;
                      
                      logger.info(`[WALLET MANAGER] 💵 DEPOSIT DETECTED: +${amount} from ${sender}`);
                      
                      // Notify Economics (Record Revenue)
                      await economics.recordRevenue(amount, `CRYPTO_SALE_${sender.substring(0,6)}`);
                      
                      // Notify CryptoMerchant (Deliver Product)
                      // Dynamic Import to avoid circular dep at boot
                      const { cryptoMerchant } = await import('./CryptoMerchant.js');
                      await cryptoMerchant.handlePayment(sender, amount, tx.hash);
                  }
              }
          } catch (e) {
              logger.error("[WALLET SCANNER] Error reading block:", e);
          }
      });
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
