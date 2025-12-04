
import { EventEmitter } from 'events';
import { mnemosyne } from '../core/mnemosyne.js';
import { simulacrum } from '../core/Simulacrum.js';
import { armory } from '../core/Armory.js';
import { realTimeCortex } from '../core/RealTimeCortex.js';
import { aegis } from '../core/Aegis.js';
import logger from '../core/logger.js';
import fs from 'fs/promises';
import path from 'path';

class OrchestratorEngine extends EventEmitter {
  constructor() {
    super(); // Initialize Event Emitter
    this.agents = {}; 
    this.tracesDir = path.resolve('./workspace/traces');
    this.agentsDir = path.resolve('./backend/agents');
    this.stateFile = path.resolve('./workspace/engine_state.json');
    this.executionQueue = [];
    this.isProcessing = false;
  }

  async init() {
     try { await fs.mkdir(this.tracesDir, { recursive: true }); } catch (e) {}
     
     // 1. RESURRECTION PROTOCOL (Load State)
     await this.loadState();

     logger.info(`[GENESIS] 🧬 Scanning biological architecture in ${this.agentsDir}...`);
     try {
       const files = await fs.readdir(this.agentsDir);
       for (const file of files) {
         if (file.endsWith('.js') && file !== 'BaseAgent.js') {
           const agentName = file.replace('.js', '');
           try {
             const modulePath = `../agents/${file}?t=${Date.now()}`;
             const module = await import(modulePath);
             const AgentClass = module[agentName] || module.default;
             if (AgentClass) {
               this.agents[agentName.toUpperCase()] = new AgentClass();
               // OMEGA: Ensure init is called
               if (this.agents[agentName.toUpperCase()].init) {
                   await this.agents[agentName.toUpperCase()].init();
               }
               logger.info(`[GENESIS] + Limb Connected: ${agentName.toUpperCase()}`);
             }
           } catch (err) {
             logger.error(`[GENESIS] Failed to graft limb ${agentName}:`, err);
           }
         }
       }
     } catch (err) {
       logger.error(`[GENESIS] Critical Failure loading agents:`, err);
     }
     this.agents['CORE'] = this;

     // START THE HEARTBEAT
     this.startProcessingLoop();
  }

  async saveState() {
      try {
          const state = {
              queue: this.executionQueue,
              lastUpdate: Date.now()
          };
          await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
      } catch (e) {
          logger.error("[ORCHESTRATOR] Failed to persist state:", e);
      }
  }

  async loadState() {
      try {
          const data = await fs.readFile(this.stateFile, 'utf8');
          const state = JSON.parse(data);
          if (state.queue && Array.isArray(state.queue)) {
              this.executionQueue = state.queue;
              logger.info(`[ORCHESTRATOR] 🕯️ RESURRECTED with ${this.executionQueue.length} pending tasks.`);
          }
      } catch (e) {
          logger.info("[ORCHESTRATOR] No previous life found. Starting fresh.");
      }
  }

  startProcessingLoop() {
      setInterval(async () => {
          if (this.executionQueue.length > 0 && !this.isProcessing) {
              this.isProcessing = true;
              const nextIntent = this.executionQueue.shift();
              await this.saveState(); // Commit dequeue
              
              try {
                  await this.processIntent(nextIntent);
              } catch (e) {
                  logger.error("[ORCHESTRATOR] 💥 Loop Crash prevented:", e);
                  // Optional: Re-queue failed critical tasks?
              } finally {
                  this.isProcessing = false;
              }
          }
      }, 500); // 2Hz Tick Rate
  }

  async loadAgentFromFile(filePath) {
      try {
          const agentName = path.basename(filePath, '.js').toUpperCase();
          const modulePath = `${filePath}?t=${Date.now()}`;
          const module = await import(modulePath);
          const AgentClass = module[agentName] || module.default;
          this.agents[agentName] = new AgentClass();
          if (this.agents[agentName].init) await this.agents[agentName].init();
          logger.info(`[ORCHESTRATOR] 🔥 Hot-Swapped Agent: ${agentName}`);
          return true;
      } catch (e) {
          logger.error(`[ORCHESTRATOR] Hot-Swap Failed:`, e);
          return false;
      }
  }

  // ... executeSwarm remains the same ...
  async executeSwarm(tasks, context) {
    let batchSize = 5; 
    logger.info(`[HYPER-SWARM] 🚀 Launching agents (Count: ${tasks.length})...`);
    
    const results = [];
    
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        const batchPromises = batch.map(async (task) => {
            const agentName = task.agent || 'BELSEBUTH';
            const agent = this.agents[agentName] || this.agents['BELSEBUTH'];
            if (!agent) return { success: false, error: `Agent ${agentName} not found` };
            
            realTimeCortex.emitTrace(agentName, `START: ${task.description}`);
            try {
                const res = await agent.run(task, context);
                realTimeCortex.emitTrace(agentName, res.success ? 'COMPLETED' : 'FAILED');
                return res;
            } catch (e) {
                return { success: false, error: e.message };
            }
        });
        results.push(...(await Promise.all(batchPromises)));
    }
    return results;
  }

  executeIntent(intentPayload) {
      logger.info(`[ORCHESTRATOR] 📥 Intent Queued: ${intentPayload.description}`);
      this.executionQueue.push(intentPayload);
      this.saveState(); // Persist enqueue
      return { status: "QUEUED", queuePosition: this.executionQueue.length };
  }

  async processIntent(intentPayload) {
    const executionId = Date.now().toString();
    const context = { executionId, startTime: new Date(), armory };
    const trace = [];

    logger.info(`[ORCHESTRATOR] 🎬 Processing: ${intentPayload.description}`);
    realTimeCortex.emit('pipeline_start', { intent: intentPayload });

    try {
        await aegis.governOutput('ORCHESTRATOR', 'INTENT_EXEC', intentPayload);

        const isWorkflow = intentPayload.payload?.action === 'DESIGN_WORKFLOW' 
                           || intentPayload.intent_type === 'WORKFLOW'
                           || (intentPayload.description && intentPayload.description.toLowerCase().includes('workflow'));

        if (isWorkflow) {
             logger.info("[ORCHESTRATOR] 🔀 Routing to NEXUS FLOW PROTOCOL...");
             let design;
             if (this.agents['RAZOR']) {
                 design = await this.agents['RAZOR'].run({ ...intentPayload, action: 'DESIGN_WORKFLOW' }, context);
             }
             if (design && design.success && design.output.nodes) {
                 if (this.agents['EXECUTOR']) {
                     await this.agents['EXECUTOR'].run({ action: 'RUN_WORKFLOW', workflow: design.output }, context);
                     realTimeCortex.emit('pipeline_complete', { executionId, status: 'SUCCESS' });
                     return;
                 }
             }
        }

        let plan;
        if (this.agents['RAZOR']) {
            let razorResult = await this.agents['RAZOR'].run(intentPayload, context);
            plan = razorResult.output;
            trace.push({ phase: 'RAZOR', output: plan });
        } else {
             plan = { stages: [{ type: 'SEQUENTIAL', tasks: [{ description: intentPayload.description, agent: 'BELSEBUTH', ...intentPayload.payload }] }] };
        }

        if (plan && plan.risk_level === 'HIGH') {
            const riskCheck = await simulacrum.simulate(plan, context);
            if (!riskCheck.simulation_success) {
                logger.error(`[ORCHESTRATOR] 🛑 Plan Rejected by Simulacrum.`);
                return;
            }
        }

        let stages = plan?.stages || [];
        for (const stage of stages) {
            logger.info(`--- STAGE EXECUTION: ${stage.id || 'MAIN'} ---`);
            realTimeCortex.emit('stage_start', { stage: stage.id, type: stage.type });
            let stageResults;
            if (stage.type === 'PARALLEL' || stage.type === 'SWARM') {
                stageResults = await this.executeSwarm(stage.tasks, context);
            } else {
                stageResults = [];
                for (const task of stage.tasks) {
                    const agentToRun = this.agents[task.agent || 'BELSEBUTH'] || this.agents['BELSEBUTH'];
                    if (agentToRun) stageResults.push(await agentToRun.run(task, context));
                }
            }
            trace.push({ phase: 'EXECUTION', stage: stage.id, results: stageResults });
        }

        await mnemosyne.saveLongTerm(`Execution ${executionId}`, { trace });
        realTimeCortex.emit('pipeline_complete', { executionId, status: 'SUCCESS' });
        this.emit('intent_completed', { executionId, trace });

    } catch (error) {
        logger.error("ORCHESTRATOR: Critical Failure", error);
        this.emit('intent_failed', { executionId, error: error.message });
    }
  }
}

export const orchestrator = new OrchestratorEngine();
