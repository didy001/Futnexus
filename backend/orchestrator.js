// orchestrator/index.js
// Designed for Cloudflare Workers or Supabase Edge Functions

const KERNEL = require('./kernel.json'); // In real edge, fetch from DB or GitHub
// import { createClient } from '@supabase/supabase-js';

// Configuration
const AGENT_REGISTRY = {
  'RAZOR': process.env.AGENT_URL_RAZOR || 'http://localhost:3001',
  'METAQUANTIQUE': process.env.AGENT_URL_META || 'http://localhost:3002',
  'BELSEBUTH': process.env.AGENT_URL_BEL || 'http://localhost:3003',
  'PHOENIX': process.env.AGENT_URL_PHX || 'http://localhost:3004'
};

/**
 * Main Entry Point for Intent Processing
 */
export default async function handleIntent(req) {
  try {
    const { intent } = await req.json();
    console.log(`[ORCHESTRATOR] Received Intent: ${intent.id} [${intent.origin}]`);

    // 1. Determine Pipeline
    const pipelineKey = intent.pipeline || 'pipeline_default';
    const modules = KERNEL.module_map[pipelineKey];

    if (!modules) {
      throw new Error(`Pipeline '${pipelineKey}' not found in Kernel.`);
    }

    // 2. Initialize Context
    let context = {
      kernelVersion: KERNEL.version,
      history: [],
      sharedMemory: {},
      startTime: Date.now()
    };

    let pipelineState = [];
    let isSuccess = true;

    // 3. Execute Pipeline
    for (const moduleKey of modules) {
      console.log(`[ORCHESTRATOR] Activating Module: ${moduleKey}`);
      
      const agentUrl = AGENT_REGISTRY[moduleKey];
      if (!agentUrl) {
        console.warn(`[ORCHESTRATOR] No URL for ${moduleKey}, skipping mock execution.`);
        continue;
      }

      // Call Agent
      const response = await fetch(`${agentUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, context })
      });

      const result = await response.json();
      
      // Update State
      pipelineState.push({ module: moduleKey, result });
      context.history.push({ module: moduleKey, output: result.output });

      // Log to System (Mock)
      console.log(`[LOG] ${moduleKey}: ${result.success ? 'SUCCESS' : 'FAIL'}`);

      // Check Policy
      if (!result.success && KERNEL.policies.fallback_strategy === 'requeue_then_alert') {
        console.error(`[CRITICAL] Module ${moduleKey} failed. Halting pipeline.`);
        isSuccess = false;
        break;
      }
    }

    // 4. Finalize
    const summary = {
      intentId: intent.id,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      pipeline: pipelineKey,
      executionTrail: pipelineState,
      duration: Date.now() - context.startTime
    };

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}