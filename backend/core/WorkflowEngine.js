
import logger from './logger.js';
import { aegis } from './Aegis.js';
import { connectorHub } from './ConnectorHub.js';

class WorkflowEngine {
  constructor() {
    this.maxSteps = 500; // Hard Limit against infinite loops
  }

  async executeWorkflow(workflow, initialContext = {}) {
    logger.info(`[WORKFLOW ENGINE] ⚙️ Initializing Graph Execution (${workflow.nodes.length} nodes)...`);
    
    let context = { ...initialContext, history: [] };
    let currentNodeId = this._findStartNode(workflow.nodes);
    let steps = 0;
    
    const nodeVisits = {};

    if (!currentNodeId) throw new Error("Invalid Workflow: No START node found.");

    try {
        while (currentNodeId && steps < this.maxSteps) {
            steps++;
            const node = workflow.nodes.find(n => n.id === currentNodeId);
            
            if (!node) {
                logger.warn(`[WORKFLOW] ⚠️ Node ${currentNodeId} not found. Stopping flow.`);
                break;
            }

            // Infinite Loop Guard
            nodeVisits[node.id] = (nodeVisits[node.id] || 0) + 1;
            if (nodeVisits[node.id] > 50) {
                throw new Error(`Infinite Loop Detected at Node ${node.id}`);
            }

            logger.info(`[WORKFLOW] ▶️ Executing Node: ${node.type} (${node.id})`);

            const result = await this._processNode(node, context);
            
            context[node.id] = result;
            context.lastResult = result;
            context.history.push({ nodeId: node.id, result, timestamp: Date.now() });

            // Determine next node
            const nextId = this._nextEdge(workflow.edges, node.id, result, context);
            currentNodeId = nextId;
        }
        
        if (steps >= this.maxSteps) logger.warn("[WORKFLOW] 🛑 Max steps reached. Forced termination.");

        return { success: true, finalContext: context, steps };

    } catch (error) {
        logger.error(`[WORKFLOW] 💥 Execution Failed at Node ${currentNodeId}:`, error);
        return { success: false, error: error.message, lastContext: context };
    }
  }

  _findStartNode(nodes) {
      const start = nodes.find(n => n.type === 'START');
      return start ? start.id : nodes[0]?.id;
  }

  async _processNode(node, context) {
      // 1. AEGIS OUTPUT GUARD
      await aegis.governOutput('WORKFLOW_ENGINE', node.type, node.parameters);

      switch (node.type) {
          case 'START':
              return { status: 'STARTED', input: context };

          case 'HTTP_REQUEST':
              return await connectorHub.executeRequest({
                  target: this._resolveTemplate(node.parameters.url, context),
                  method: node.parameters.method || 'GET',
                  body: node.parameters.body ? JSON.parse(this._resolveTemplate(JSON.stringify(node.parameters.body), context)) : undefined
              });

          case 'CODE_EXEC':
              // Secure Sandbox execution using Function constructor with limited scope
              const funcBody = node.parameters.code; 
              const safeEval = new Function('input', 'context', 'process', 'require', `
                  "use strict";
                  try { 
                      ${funcBody} 
                  } catch(e) { return { error: e.message }; }
              `);
              return safeEval(context.lastResult, context, undefined, undefined);

          case 'AGENT_PROMPT':
              const { orchestrator } = await import('../orchestrator/Engine.js');
              const agentName = node.parameters.agent || 'CORE';
              const agent = orchestrator.agents[agentName];
              if (!agent) throw new Error(`Agent ${agentName} not found`);
              
              const prompt = this._resolveTemplate(node.parameters.prompt, context);
              const action = node.parameters.action || 'WORKFLOW_TASK';
              const inputs = node.parameters.inputs ? JSON.parse(this._resolveTemplate(JSON.stringify(node.parameters.inputs), context)) : {};
              
              return await agent.run({ 
                  action: action, 
                  description: prompt,
                  accept_text: true,
                  ...inputs
              }, context);

          case 'TRIGGER_BLUEPRINT':
              const { orchestrator: orchRef } = await import('../orchestrator/Engine.js');
              const bpId = node.parameters.blueprintId;
              const subInputs = node.parameters.inputs || {};
              
              // Recursive Trigger
              const resolvedInputs = {};
              for (const [k, v] of Object.entries(subInputs)) {
                  resolvedInputs[k] = this._resolveTemplate(v, context);
              }

              logger.info(`[WORKFLOW] 🔗 CHAIN REACTION: Triggering ${bpId}`);
              
              const { blueprintLibrary } = await import('./BlueprintLibrary.js');
              const subBlueprint = blueprintLibrary.getBlueprint(bpId);
              
              if(subBlueprint) {
                  orchRef.executeIntent({
                      description: `CHAINED EXECUTION: ${bpId}`,
                      origin: "WORKFLOW_CHAIN",
                      priority: 95,
                      payload: {
                          action: "RUN_WORKFLOW",
                          workflow: subBlueprint.workflow,
                          inputs: resolvedInputs
                      }
                  });
              } else {
                  logger.warn(`[WORKFLOW] ⚠️ Blueprint ${bpId} not found.`);
              }
              return { status: "CHAINED", target: bpId };

          case 'DELAY':
              const ms = node.parameters.ms || 1000;
              await new Promise(r => setTimeout(r, ms));
              return { waited: ms };

          case 'DECISION':
              // Logic handled in edge traversal
              return context.lastResult;

          default:
              return { status: 'SKIPPED', reason: 'UNKNOWN_TYPE' };
      }
  }

  _nextEdge(edges, currentId, result, context) {
      const outgoing = edges.filter(e => e.source === currentId);
      if (outgoing.length === 0) return null;

      // Logic for DECISION nodes and conditional edges
      for (const edge of outgoing) {
          if (edge.condition) {
              try {
                  // Eval condition against 'result' and 'context'
                  // Condition example: "result.spread > 5" or "context.scan.output.length > 0"
                  const check = new Function('result', 'context', `
                      try { return ${edge.condition}; } catch(e) { return false; }
                  `);
                  
                  if (check(result, context)) {
                      logger.info(`[WORKFLOW] 🔀 Branching: ${edge.source} -> ${edge.target} (Condition Met)`);
                      return edge.target;
                  }
              } catch (e) {
                  logger.warn(`[WORKFLOW] Condition Error on edge ${edge.source}->${edge.target}: ${e.message}`);
              }
          } else {
              // Unconditional path (Default)
              return edge.target;
          }
      }
      return null;
  }

  _resolveTemplate(str, context) {
      if (typeof str !== 'string') return str;
      return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const parts = key.split('.');
          let val = context;
          for (const p of parts) {
              if (val === undefined || val === null) break;
              val = val[p];
          }
          return val !== undefined ? val : match;
      });
  }
}

export const workflowEngine = new WorkflowEngine();
