
import logger from './logger.js';
import { aegis } from './Aegis.js';
import { connectorHub } from './ConnectorHub.js';

class WorkflowEngine {
  constructor() {
    this.maxSteps = 500; // Hard Limit
  }

  async executeWorkflow(workflow, initialContext = {}) {
    logger.info(`[WORKFLOW ENGINE] ⚙️ Initializing Graph Execution (${workflow.nodes.length} nodes)...`);
    
    let context = { ...initialContext, history: [] };
    let currentNodeId = this._findStartNode(workflow.nodes);
    let steps = 0;
    
    // LOOP DETECTION
    const nodeVisits = {};

    if (!currentNodeId) throw new Error("Invalid Workflow: No START node found.");

    try {
        while (currentNodeId && steps < this.maxSteps) {
            steps++;
            const node = workflow.nodes.find(n => n.id === currentNodeId);
            
            if (!node) {
                logger.warn(`[WORKFLOW] ⚠️ Node ${currentNodeId} not found. Stopping.`);
                break;
            }

            // Loop Guard
            nodeVisits[node.id] = (nodeVisits[node.id] || 0) + 1;
            if (nodeVisits[node.id] > 50) {
                throw new Error(`Infinite Loop Detected at Node ${node.id}`);
            }

            logger.info(`[WORKFLOW] ▶️ Executing Node: ${node.type} (${node.label || node.id})`);

            const result = await this._processNode(node, context);
            
            context[node.id] = result;
            context.lastResult = result;
            context.history.push({ nodeId: node.id, result, timestamp: Date.now() });

            currentNodeId = this._nextEdge(workflow.edges, node.id, result);
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
      await aegis.governOutput('WORKFLOW_ENGINE', node.type, node.parameters);

      switch (node.type) {
          case 'START':
              return { status: 'STARTED' };

          case 'HTTP_REQUEST':
              return await connectorHub.executeRequest({
                  target: this._resolveTemplate(node.parameters.url, context),
                  method: node.parameters.method || 'GET',
                  body: node.parameters.body ? JSON.parse(this._resolveTemplate(JSON.stringify(node.parameters.body), context)) : undefined
              });

          case 'CODE_EXEC':
              // HARDENED SANDBOX
              const funcBody = node.parameters.code; 
              // We block access to process, require, and global
              const safeEval = new Function('input', 'context', 'process', 'require', 'global', `
                  "use strict";
                  try { 
                      ${funcBody} 
                  } catch(e) { return { error: e.message }; }
              `);
              return safeEval(context.lastResult, context, undefined, undefined, undefined);

          case 'AGENT_PROMPT':
              const { orchestrator } = await import('../orchestrator/Engine.js');
              const agentName = node.parameters.agent || 'CORE';
              const agent = orchestrator.agents[agentName];
              if (!agent) throw new Error(`Agent ${agentName} not found`);
              
              const prompt = this._resolveTemplate(node.parameters.prompt, context);
              return await agent.run({ 
                  action: 'WORKFLOW_TASK', 
                  description: prompt,
                  accept_text: true 
              });

          case 'DELAY':
              const ms = node.parameters.ms || 1000;
              await new Promise(r => setTimeout(r, ms));
              return { waited: ms };

          case 'DECISION':
              return context.lastResult;

          default:
              return { status: 'SKIPPED', reason: 'UNKNOWN_TYPE' };
      }
  }

  _nextEdge(edges, currentId, result) {
      const outgoing = edges.filter(e => e.source === currentId);
      if (outgoing.length === 0) return null;

      for (const edge of outgoing) {
          if (edge.condition) {
              try {
                  const check = new Function('result', `return ${edge.condition}`);
                  if (check(result)) return edge.target;
              } catch (e) {
                  logger.warn(`[WORKFLOW] Condition Error on edge ${edge.source}->${edge.target}: ${e.message}`);
              }
          } else {
              return edge.target;
          }
      }
      return null;
  }

  _resolveTemplate(str, context) {
      if (!str) return str;
      return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const parts = key.split('.');
          let val = context;
          for (const p of parts) {
              val = val ? val[p] : undefined;
          }
          return val !== undefined ? val : match;
      });
  }
}

export const workflowEngine = new WorkflowEngine();
