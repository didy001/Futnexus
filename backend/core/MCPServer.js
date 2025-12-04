
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import logger from './logger.js';
import { armory } from './Armory.js';
import { blueprintLibrary } from './BlueprintLibrary.js';
import { orchestrator } from '../orchestrator/Engine.js';

/**
 * NEXUS MCP BRIDGE
 * Exposes Nexus capabilities as standard MCP Tools.
 * Allows external AI (Claude, Cursor) to use Nexus as a "Body".
 */
class NexusMcpServer {
  constructor() {
    this.server = new McpServer({
      name: "Nexus Omega Core",
      version: "9.1.0"
    });
    this.transport = null;
  }

  async init(app) {
    logger.info('[MCP BRIDGE] 🔌 Initializing Model Context Protocol Server...');

    // 1. EXPOSE ARMORY TOOLS
    // We map internal Armory tools to MCP definitions
    this.server.tool(
      "nexus_system_exec",
      "Execute a command on the Nexus Host System (Shell)",
      { command: z.string() },
      async ({ command }) => {
        logger.info(`[MCP] ⚡ External Agent requested Shell: ${command}`);
        // Route through Armory for safety checks (AEGIS is active inside Armory)
        // Note: Armory doesn't have a raw 'exec' tool public for safety, 
        // we map to a safe equivalent or use 'SSH_EXEC' if local.
        // For this bridge, we expose 'LIST_PROCESSES' and 'SYSTEM_INFO' as examples.
        return { content: [{ type: "text", text: "Direct Shell via MCP is restricted. Use specific tools." }] };
      }
    );

    this.server.tool(
      "nexus_get_system_info",
      "Get telemetry from the Nexus Host Machine",
      {},
      async () => {
        const info = await armory.use('SYSTEM_INFO');
        return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
      }
    );

    this.server.tool(
      "nexus_run_blueprint",
      "Execute a pre-defined Nexus Workflow (Blueprint)",
      { 
          blueprint_id: z.string().describe("ID of the blueprint (e.g., LEAD_CAPTURE)"),
          inputs: z.string().describe("JSON string of inputs") 
      },
      async ({ blueprint_id, inputs }) => {
        logger.info(`[MCP] 📜 External Agent invoked Blueprint: ${blueprint_id}`);
        
        const payload = {
            description: `MCP Triggered: ${blueprint_id}`,
            origin: "MCP_EXTERNAL",
            priority: 80,
            payload: {
                action: "RUN_WORKFLOW",
                workflow: blueprintLibrary.getBlueprint(blueprint_id)?.workflow
            }
        };
        
        if (inputs) {
            // Merge inputs into context logic would go here
            // For now we just trigger the intent
        }

        const result = orchestrator.executeIntent(payload);
        return { content: [{ type: "text", text: `Blueprint execution queued. ID: ${result.queuePosition}` }] };
      }
    );

    this.server.tool(
        "nexus_list_blueprints",
        "List all available capabilities/blueprints in Nexus",
        {},
        async () => {
            const list = Array.from(blueprintLibrary.library.values()).map(b => `${b.id}: ${b.description}`);
            return { content: [{ type: "text", text: list.join('\n') }] };
        }
    );

    // 2. MOUNT SSE TRANSPORT ON EXPRESS
    // This allows Claude Desktop to connect via SSE
    app.get("/mcp/sse", async (req, res) => {
        logger.info("[MCP] 🔗 New SSE Connection established.");
        this.transport = new SSEServerTransport("/mcp/messages", res);
        await this.server.connect(this.transport);
    });

    app.post("/mcp/messages", async (req, res) => {
        if (this.transport) {
            await this.transport.handlePostMessage(req, res);
        }
    });

    logger.info('[MCP BRIDGE] ✅ MCP Server Ready on /mcp/sse');
  }
}

export const mcpServer = new NexusMcpServer();
