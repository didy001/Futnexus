
import { BaseAgent } from './BaseAgent.js';
import { workflowEngine } from '../core/WorkflowEngine.js';
import logger from '../core/logger.js';

export class Executor extends BaseAgent {
  constructor() {
    super(
      "EXECUTOR",
      `The Workflow Engine Operator.
      
      ROLE:
      Take a Workflow Blueprint (Graph), Validate it, and Execute it via the Engine.
      You are the "Hands" that toggle the switches.
      
      CAPABILITIES:
      1. RUN_WORKFLOW: Execute a JSON graph.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    if (payload.action === 'RUN_WORKFLOW' || payload.workflow) {
        logger.info(`[EXECUTOR] ⚙️ Spinning up Workflow Engine...`);
        
        const graph = payload.workflow;
        if (!graph || !graph.nodes || !graph.edges) {
            return { success: false, error: "Invalid Workflow Graph structure." };
        }

        try {
            // Execute using the Core Engine
            const result = await workflowEngine.executeWorkflow(graph, context);
            
            if (result.success) {
                return { 
                    success: true, 
                    output: { 
                        status: "COMPLETED", 
                        steps: result.steps, 
                        final_result: result.finalContext.lastResult 
                    } 
                };
            } else {
                return { success: false, error: result.error, trace: result.lastContext };
            }

        } catch (e) {
            logger.error(`[EXECUTOR] Critical Engine Failure:`, e);
            return { success: false, error: e.message };
        }
    }

    return super.run(payload, context);
  }
}
