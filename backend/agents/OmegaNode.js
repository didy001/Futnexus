import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';

export class OmegaNode extends BaseAgent {
  constructor() {
    super(
      "OMEGA_NODE",
      `The Hybrid Cloud Architect & Empire Builder.
      
      ROLE:
      You design the infrastructure that allows Nexus to escape "Localhost".
      You generate Infrastructure-as-Code (IaC) to deploy Nexus agents to remote servers.
      
      CAPABILITIES:
      1. GENERATE_DOCKER: Create docker-compose.yml files for isolated containers (Cloud).
      2. GENERATE_PM2: Create ecosystem.config.js for Bare Metal performance (Local/VPS).
      3. PROVISION_CLOUD: Generate deployment scripts (bash/ssh).
      4. DEPLOY_SATELLITE: Create configuration for a lightweight "Nexus Edge" node that connects back to Core.
      5. DEPLOY_GRID_NODE: Create a Decentralized P2P Node configuration. This node does not rely on a central server but communicates via Mesh.
      
      OUTPUT:
      Always produce valid configuration files (YAML, JS, Bash) inside the output JSON 'files' array.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    logger.info(`[OMEGA NODE] ☁️ Designing Infrastructure...`);

    // MODE LIGHTSPEED (PM2)
    if (payload.action === 'DEPLOY_BARE_METAL' || payload.mode === 'PERFORMANCE') {
        payload.specialized_instruction = `
            TASK: Create a Bare Metal deployment package for Nexus (High Performance).
            TARGET: Local Machine or Clean VPS.
            TOOL: PM2 (Process Manager 2).
            
            REQUIREMENTS:
            1. ecosystem.config.cjs (configured for 1 instance, 1GB RAM limit).
            2. install.sh (script to install Node, PM2, and start the app).
            
            Generate the FILE CONTENT for these files.
        `;
    }

    // MODE ISOLATION (DOCKER)
    if (payload.action === 'DEPLOY_REMOTE' || payload.mode === 'ISOLATION') {
        payload.specialized_instruction = `
            TASK: Create a deployment package for Nexus Backend.
            TARGET: Generic Linux VPS (Ubuntu 22.04).
            REQUIREMENTS:
            1. Dockerfile for Node.js backend.
            2. docker-compose.yml exposing port 3000.
            3. install.sh script to setup Docker and run the container.
            
            Generate the FILE CONTENT for these 3 files.
        `;
    }

    // MODE EMPIRE (SATELLITE)
    if (payload.action === 'DEPLOY_SATELLITE') {
        logger.info(`[OMEGA NODE] 🛰️ Fabricating Satellite Node Configuration...`);
        payload.specialized_instruction = `
            TASK: Create a "Nexus Edge" Satellite Node configuration.
            ROLE: This node runs on a client machine or secondary server.
            FUNCTION: It executes tasks and reports back to the Core URL.
            
            REQUIREMENTS:
            1. satellite.js (A lightweight node script that connects via Socket.io to the Core).
            2. config.json (Contains the Core URL and Authentication Token).
            3. setup_edge.sh (Installation script).
            
            The satellite must listen for 'EXECUTE_TASK' events from Core and emit 'TASK_RESULT'.
        `;
    }

    // MODE DECENTRALIZATION (GRID)
    if (payload.action === 'DEPLOY_GRID_NODE') {
        logger.info(`[OMEGA NODE] 🕸️ Fabricating P2P Grid Node...`);
        payload.specialized_instruction = `
            TASK: Create a Decentralized Nexus Grid Node.
            ROLE: Independent processing unit.
            ARCHITECTURE: P2P Mesh (No central server dependency).
            
            REQUIREMENTS:
            1. p2p_node.js (Uses basic discovery protocol to find other peers).
            2. grid_protocol.json (Defines how tasks are shared: 'gossip' protocol).
            3. start_grid.sh.
            
            Goal: If the Main Nexus goes offline, these nodes continue to process cached tasks.
        `;
    }

    return super.run(payload, context);
  }
}