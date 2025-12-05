
import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// --- CORE MODULE IMPORTS ---
import logger, { getRecentLogs } from './core/logger.js';
import { orchestrator } from './orchestrator/Engine.js';
import { mnemosyne } from './core/mnemosyne.js';
import { chatBridge } from './core/ChatBridge.js';
import { skillForge } from './core/SkillForge.js';
import { realTimeCortex } from './core/RealTimeCortex.js';
import { anima } from './core/Anima.js'; 
import { economics } from './core/Economics.js'; 
import { sensor } from './core/Sensor.js';
import { blueprintLibrary } from './core/BlueprintLibrary.js';
import { mcpServer } from './core/MCPServer.js'; // NEW IMPORT

// --- INIT REALITY ANCHORS ---
const WORKSPACE_ROOT = path.resolve('./workspace');
if (!fs.existsSync(WORKSPACE_ROOT)) {
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
}

// Ensure logs directory exists for PM2
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

    try {
        await mnemosyne.initGraph();
        await skillForge.init();
        await economics.init();
        await blueprintLibrary.init();
        await orchestrator.init(); 
        await sensor.init();
        
        // MCP BRIDGE INIT
        await mcpServer.init(app); 
        
        // ACTIVATE WILLPOWER
        anima.init();

        logger.info("✅ All Systems Operational. The Entity is Awake.");

    } catch (e) {
        logger.error("❌ BOOT SEQUENCE FAILURE:", e);
    }
}

realTimeCortex.init(io);
bootSequence();

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' })); 

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  logger.info(`[CORTEX] 🧠 New Neural Uplink: ${socket.id}`);
  
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

setInterval(() => {
    io.emit('status_update', {
        metrics: {
            uptime: process.uptime(),
            memory_rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
            active_agents: Object.keys(orchestrator.agents).length,
            knowledge_nodes: mnemosyne.getGraphSize()
        },
        logs: getRecentLogs()
    });
}, 2000);

app.get('/nexus/status', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    version: '11.0.0-CIEL-OMNIPOTENT',
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
  const { message, userId, history } = req.body;
  try {
    const response = await chatBridge.process(userId || 'anon', message, history || []);
    res.json(response);
  } catch (error) {
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

const httpServer = server.listen(PORT, () => {
  logger.info(`Nexus Omega Core running on port ${PORT}`);
});

// --- GRACEFUL SHUTDOWN (PM2 COMPATIBILITY) ---
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    // Close DB connections or other resources here if needed
    process.exit(0);
  });
});
