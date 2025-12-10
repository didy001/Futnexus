
import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// --- CORE MODULE IMPORTS ---
import logger, { getRecentLogs, logEvents } from './core/logger.js';
import { ImmutableCore } from './core/ImmutableCore.js'; // THE SANCTUARY
import { orchestrator } from './orchestrator/Engine.js';
import { mnemosyne } from './core/mnemosyne.js';
import { chatBridge } from './core/ChatBridge.js';
import { skillForge } from './core/SkillForge.js';
import { realTimeCortex } from './core/RealTimeCortex.js';
import { anima } from './core/Anima.js'; 
import { economics } from './core/Economics.js'; 
import { sensor } from './core/Sensor.js';
import { blueprintLibrary } from './core/BlueprintLibrary.js';
import { mcpServer } from './core/MCPServer.js';
import { llmClient } from './core/LlmClient.js';
import { walletManager } from './core/WalletManager.js'; 
import { cryptoMerchant } from './core/CryptoMerchant.js'; 
import { hypnos } from './agents/Hypnos.js'; 
import { interventionManager } from './core/InterventionManager.js'; 
import { tachyon } from './core/Tachyon.js'; 
import { selfHealer } from './core/SelfHealer.js'; // OROBOROS PROTOCOL

// --- OMEGA MODULES (THE 5 ORGANS) ---
import { stabilityCore } from './modules/StabilityCore.js';
import { stoicPlanner } from './modules/StoicPlanner.js';
import { generatorEcosystem } from './modules/GeneratorEcosystem.js';
import { roiEngine } from './modules/RoiEngine.js';
import { sentinelLongTerm } from './modules/SentinelLongTerm.js';
import { profitStream } from './modules/ProfitStream.js'; 
import { evolutionaryEngine } from './modules/EvolutionaryEngine.js'; 

// --- INIT REALITY ANCHORS ---
const WORKSPACE_ROOT = path.resolve('./workspace');
if (!fs.existsSync(WORKSPACE_ROOT)) {
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
}

const PUBLIC_ROOT = path.resolve('./workspace/public');
if (!fs.existsSync(PUBLIC_ROOT)) {
  fs.mkdirSync(PUBLIC_ROOT, { recursive: true });
}

const LOGS_ROOT = path.resolve('./logs');
if (!fs.existsSync(LOGS_ROOT)) {
  fs.mkdirSync(LOGS_ROOT, { recursive: true });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- INITIALIZATION SEQUENCE ---
async function bootSequence() {
    logger.info("Initializing NEXUS OMEGA CORE [DEVSHADOW PERFECT]...");
    
    // 0. INTEGRITY CHECK (IMMUTABLE CORE)
    if (!ImmutableCore.PRIME_DIRECTIVES || ImmutableCore.MASTER_IDENTITY.NAME !== 'SHADOW') {
        logger.error("❌ FATAL: IMMUTABLE CORE CORRUPTED. SYSTEM HALTED.");
        process.exit(1);
    }
    logger.info(`[BOOT] 🔒 Immutable Core Verified. Serving Master: ${ImmutableCore.MASTER_IDENTITY.NAME}`);

    try {
        await mnemosyne.initGraph();
        await skillForge.init();
        profitStream.init(); 
        await economics.init();
        await walletManager.init(); 
        await cryptoMerchant.init(); 
        await blueprintLibrary.init();
        await orchestrator.init(); 
        await sensor.init();
        await mcpServer.init(app); 
        
        await stabilityCore.init();
        stoicPlanner.init();
        generatorEcosystem.init();
        roiEngine.init();
        sentinelLongTerm.init();
        evolutionaryEngine.init(); 
        
        anima.init();
        await hypnos.init(); 

        logger.info("✅ All Systems Operational. The Entity is Awake.");

    } catch (e) {
        logger.error("❌ BOOT SEQUENCE FAILURE:", e);
        // Fallback heal attempt at boot
        selfHealer.handleCriticalError(e, "BOOT_SEQUENCE");
    }
}

realTimeCortex.init(io);

// --- NERVOUS SYSTEM WIRING (LOGGER -> CORTEX) ---
logEvents.on('entry', (logEntry) => {
    realTimeCortex.emitLog(logEntry);
});

// Hook Task Completion to Evolution
orchestrator.on('intent_completed', () => {
    evolutionaryEngine.registerTaskCompletion();
});

// --- PROTOCOL LAZARUS (GLOBAL ERROR TRAP) ---
// Instead of crashing, we feed the error to OROBOROS (SelfHealer)
process.on('uncaughtException', (err) => {
    logger.error('💥 UNCAUGHT EXCEPTION INTERCEPTED BY LAZARUS:', err);
    selfHealer.handleCriticalError(err, "UNCAUGHT_EXCEPTION");
    // We do NOT exit. We heal.
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 UNHANDLED REJECTION INTERCEPTED BY LAZARUS:', reason);
    selfHealer.handleCriticalError(reason instanceof Error ? reason : new Error(String(reason)), "UNHANDLED_REJECTION");
});

bootSequence();

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' })); 

app.use('/public', express.static(PUBLIC_ROOT));

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  logger.info(`[CORTEX] 🧠 New Neural Uplink: ${socket.id}`);
  
  // Initial State Dump
  socket.emit('status_update', {
    metrics: {
      uptime: process.uptime(),
      memory_rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      active_agents: Object.keys(orchestrator.agents).length,
      knowledge_nodes: mnemosyne.getGraphSize()
    },
    logs: getRecentLogs() 
  });
});

// Heartbeat for Metrics & Evolution
setInterval(() => {
    io.emit('metrics_update', {
        uptime: process.uptime(),
        memory_rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        active_agents: Object.keys(orchestrator.agents).length,
        knowledge_nodes: mnemosyne.getGraphSize()
    });
    
    // Broadcast Evolution Stats
    io.emit('evolution_update', evolutionaryEngine.getEvolutionStats());
}, 2000);

// --- ROUTES ---

app.get('/health', (req, res) => {
    const solvency = economics.getSolvencyStatus();
    res.json({
        status: 'OPERATIONAL',
        identity: 'NEXUS-OMEGA-CIEL',
        mode: solvency === 'WAR_ECONOMY' ? 'SURVIVAL_PROTOCOL' : 'CONQUEST_MODE',
        brain: llmClient.useLocal ? 'LOCAL_SOVEREIGN' : 'CLOUD_ASCENDED',
        agents: Object.keys(orchestrator.agents).length,
        uptime: process.uptime()
    });
});

app.get('/nexus/status', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    version: '12.0.0-CAPITAL-SINGULARITY',
    metrics: {
      uptime: process.uptime(),
      memory_rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      active_agents: Object.keys(orchestrator.agents).length,
      knowledge_nodes: mnemosyne.getGraphSize()
    },
    logs: getRecentLogs() 
  });
});

app.post('/nexus/chat', async (req, res) => {
  const { message, userId, history, image } = req.body;
  try {
    tachyon.predictAndPreload(message, history || []);
    // OCULUS: Pass image to ChatBridge
    const response = await chatBridge.process(userId || 'anon', message, history || [], image);
    res.json(response);
  } catch (error) {
    logger.error("Chat Error", error);
    res.status(500).json({ error: "Communications link failed." });
  }
});

app.post('/nexus/execute', async (req, res) => {
  const intent = req.body;
  const result = orchestrator.executeIntent(intent);
  res.json(result);
});

app.post('/nexus/ingest', async (req, res) => {
    const { data, type, source } = req.body;
    try {
        logger.info(`[UPLINK] 📥 Receiving Data Stream from ${source || 'SHADOW'}...`);
        const result = await sensor.processDigitalInput(data, type, source);
        res.json(result);
    } catch (e) {
        logger.error(`[UPLINK] Ingestion Failed:`, e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/nexus/intervention/resolve', async (req, res) => {
    const { id, value } = req.body;
    const success = interventionManager.resolve(id, value);
    if (success) res.json({ status: 'RESOLVED' });
    else res.status(404).json({ error: 'Intervention not found or expired' });
});

const httpServer = server.listen(PORT, () => {
  logger.info(`Nexus Omega Core running on port ${PORT}`);
  logger.info(`Public Delivery Node active at http://localhost:${PORT}/public`);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});
