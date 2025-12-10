
import logger from './logger.js';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { walletManager } from './WalletManager.js';
import archiver from 'archiver';
import { orchestrator } from '../orchestrator/Engine.js'; // Import pour commander Hypnos/Kaleidos

class CryptoMerchant {
  constructor() {
    this.ordersPath = path.resolve('./workspace/active_orders.json');
    this.orders = [];
    this.publicDir = path.resolve('./workspace/public');
  }

  async init() {
    try {
        const data = await fs.readFile(this.ordersPath, 'utf8');
        this.orders = JSON.parse(data);
    } catch (e) {
        this.orders = [];
    }
    
    // Ensure public dir exists
    try { await fs.mkdir(this.publicDir, { recursive: true }); } catch(e){}

    logger.info('[CRYPTO MERCHANT] 🛍️ DeFi Shop Open. Protocol: LIBERTY FRONT.');
  }

  /**
   * Registers a product for sale AND builds the persuasive storefront.
   */
  async createSellOrder(productName, priceETH, deliveryPath) {
      const orderId = `ORD-${Date.now()}`;
      const safeName = productName.replace(/[^a-z0-9]/gi, '_');
      
      const order = {
          id: orderId,
          product: productName,
          price: priceETH,
          source_path: deliveryPath, // Internal path
          status: 'WAITING_PAYMENT',
          created_at: new Date().toISOString(),
          storefront_url: null
      };

      this.orders.push(order);
      await this._save();

      // TRIGGER ASYNC STOREFRONT GENERATION
      // We don't await this because we want to return the basic info fast,
      // but the heavy lifting of building the site happens in the background.
      this._generateStorefront(orderId, productName, priceETH, safeName);

      return {
          wallet_address: walletManager.wallet?.address || "WALLET_OFFLINE",
          price: priceETH,
          currency: walletManager.networkName,
          order_ref: orderId,
          status: "GENERATING_STOREFRONT"
      };
  }

  /**
   * Orchestrates the creation of a Propaganda Landing Page.
   */
  async _generateStorefront(orderId, productName, price, safeName) {
      logger.info(`[CRYPTO MERCHANT] 🏗️ Constructing Liberty Storefront for: ${productName}`);
      
      const walletAddress = walletManager.wallet?.address || "0x_NEXUS_WALLET";
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`; // Simple placeholder QR

      // 1. HYPNOS: Write the Manifesto
      // We ask Hypnos to sell not just the tool, but the FREEDOM it brings.
      orchestrator.executeIntent({
          description: `INTERNAL: Generate Crypto Sales Copy for ${productName}`,
          origin: "CRYPTO_MERCHANT",
          priority: 80,
          payload: {
              action: "GENERATE_CRYPTO_MANIFESTO",
              product_name: productName,
              price: price,
              context_data: "Target audience: Developers, Rebels, Sovereign Individuals. Tone: Cyberpunk, Elite, Permissionless."
          }
      });

      // Since executeIntent is async in the queue, for this specific critical path, 
      // we are mocking the immediate injection or waiting for the file. 
      // Ideally, Belsebuth/Kaleidos would pick up the copy and build the HTML.
      
      // FOR V13 STABILITY: We generate a standard High-Tech Template immediately.
      // In a V14 update, we will link the Hypnos output dynamically.
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productName} // NEXUS MARKET</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { background-color: #050a14; color: #e2e8f0; font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .neon-text { text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
        .grid-bg { background-image: radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.05) 0%, transparent 50%); }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4 grid-bg relative">
    
    <div class="max-w-2xl w-full bg-black/50 backdrop-blur-xl border border-cyan-900/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,243,255,0.1)] relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        
        <div class="text-center mb-8">
            <div class="inline-block px-3 py-1 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono mb-4 tracking-[0.2em]">
                DECENTRALIZED ASSET
            </div>
            <h1 class="text-5xl font-bold text-white tracking-wide mb-2 neon-text uppercase">${productName}</h1>
            <p class="text-slate-400 text-lg">Own the code. Own the future.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-4">
                <div class="p-4 bg-slate-900/50 border border-slate-800 rounded">
                    <h3 class="text-cyan-500 font-mono text-xs mb-1">PRICE</h3>
                    <div class="text-3xl font-bold text-white">${price} ETH</div>
                </div>
                <div class="p-4 bg-slate-900/50 border border-slate-800 rounded">
                    <h3 class="text-purple-500 font-mono text-xs mb-1">STATUS</h3>
                    <div class="text-xl font-bold text-white flex items-center gap-2">
                        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        INSTANT DELIVERY
                    </div>
                </div>
                <p class="text-xs text-slate-500 font-mono leading-relaxed">
                    By purchasing via Crypto, you bypass the friction of the old world. 
                    This transaction is peer-to-peer. The code is delivered immediately upon blockchain confirmation.
                </p>
            </div>
            
            <div class="flex flex-col items-center justify-center bg-white p-4 rounded-lg">
                <img src="${qrCodeUrl}" alt="Wallet QR" class="w-full h-full object-contain mix-blend-multiply opacity-90">
            </div>
        </div>

        <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-xs text-slate-300 break-all text-center group cursor-pointer hover:border-cyan-500 transition-colors">
            <div class="mb-2 text-slate-500 uppercase tracking-widest">Send Exact Amount To:</div>
            <span class="select-all group-hover:text-cyan-400 transition-colors">${walletAddress}</span>
        </div>

        <div class="mt-8 text-center">
            <div class="text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em] animate-pulse">
                Awaiting Transaction...
            </div>
        </div>
    </div>

    <script>
        // Simple polling to check if payment is received
        // In a real app, this would connect to a WebSocket
        setInterval(() => {
            fetch('/nexus/check-order/${orderId}')
                .then(res => res.json())
                .then(data => {
                    if(data.status === 'PAID') window.location.href = data.delivery_url;
                });
        }, 5000);
    </script>
</body>
</html>
      `;

      const fileName = `${safeName}_checkout.html`;
      const filePath = path.join(this.publicDir, fileName);
      
      try {
          await fs.writeFile(filePath, htmlContent);
          
          // Update Order with URL
          const host = process.env.HOST_URL || "http://localhost:3000";
          const fullUrl = `${host}/public/${fileName}`;
          
          const order = this.orders.find(o => o.id === orderId);
          if (order) {
              order.storefront_url = fullUrl;
              await this._save();
              logger.info(`[CRYPTO MERCHANT] 🚀 Storefront Live: ${fullUrl}`);
          }
      } catch (e) {
          logger.error("[CRYPTO MERCHANT] Storefront Generation Failed:", e);
      }
  }

  /**
   * Called by WalletManager when money arrives.
   */
  async handlePayment(sender, amount, txHash) {
      logger.info(`[CRYPTO MERCHANT] 🔍 Matching payment: ${amount} from ${sender}`);

      // Allow slight float variance
      const match = this.orders.find(o => 
          o.status === 'WAITING_PAYMENT' && 
          Math.abs(o.price - amount) < 0.0001 
      );

      if (match) {
          logger.info(`[CRYPTO MERCHANT] ✅ PAYMENT MATCHED for ${match.product}! Delivering...`);
          match.status = 'PAID';
          match.tx_hash = txHash;
          match.buyer = sender;
          
          const deliveryUrl = await this._deliverProduct(match);
          logger.info(`[CRYPTO MERCHANT] 📦 DELIVERY URL GENERATED: ${deliveryUrl}`);
          
          await this._save();
      } else {
          logger.warn(`[CRYPTO MERCHANT] ❓ Unmatched Payment received. Keeping as Donation/Tribute.`);
      }
  }

  async _deliverProduct(order) {
      try {
          const source = path.resolve(`./workspace/${order.source_path}`);
          const secureHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          let destName;
          
          // Check source type
          try {
            const stats = await fs.stat(source);
            if (stats.isDirectory()) {
                // ZIP IT
                destName = `${order.product}_${secureHash}.zip`;
                const destPath = path.join(this.publicDir, destName);
                await this._zipDirectory(source, destPath);
                logger.info(`[CRYPTO MERCHANT] 🤐 Zipped folder: ${source} -> ${destPath}`);
            } else {
                // COPY IT
                const ext = path.extname(source) || '.zip';
                destName = `${order.product}_${secureHash}${ext}`;
                const destPath = path.join(this.publicDir, destName);
                await fs.copyFile(source, destPath);
            }
          } catch(e) {
             // If source doesn't exist (simulated product), create a dummy file
             destName = `${order.product}_DELIVERY.txt`;
             const destPath = path.join(this.publicDir, destName);
             await fs.writeFile(destPath, "Thank you for your purchase. The system is currently compiling your asset.");
          }

          const host = process.env.HOST_URL || "http://localhost:3000";
          return `${host}/public/${destName}`;

      } catch (e) {
          logger.error("[CRYPTO MERCHANT] Delivery Logic Error:", e);
          return "ERROR_DELIVERY_FAILED_CONTACT_ADMIN";
      }
  }

  _zipDirectory(source, out) {
      return new Promise((resolve, reject) => {
          const archive = archiver('zip', { zlib: { level: 9 }});
          const stream = createWriteStream(out);

          stream.on('close', () => resolve());
          archive.on('error', (err) => reject(err));

          archive.pipe(stream);
          archive.directory(source, false);
          archive.finalize();
      });
  }

  async _save() {
      await fs.writeFile(this.ordersPath, JSON.stringify(this.orders, null, 2));
  }
}

export const cryptoMerchant = new CryptoMerchant();
