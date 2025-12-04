import { NexusModule } from "../types";

// NEXUS CORE UPLINK CONFIGURATION
const CORE_URL = "http://localhost:3000";

/**
 * Sends a message to the Nexus Core Backend (ChatBridge).
 * This replaces the direct Gemini API call with a call to the autonomous backend.
 */
export const queryNexusModule = async (
  module: NexusModule,
  history: { role: string; text: string }[],
  userMessage: string
): Promise<string> => {
  try {
    // Attempt real backend connection
    const response = await fetch(`${CORE_URL}/nexus/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "OPERATOR_01",
        message: userMessage,
        history: history,
        meta: {
          targetModule: module.id, // Use ID to match backend keys
          role: module.role
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Core Uplink Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.meta && data.meta.intent === "SWARM_ACTIVATED") {
      return `[SYSTEM ALERT] ⚠️ SWARM PROTOCOL INITIATED.\n${data.content}`;
    }

    return data.content || "No response from Core.";

  } catch (error) {
    console.warn("Nexus Backend Offline. Switching to Local Simulation Mode.");
    // Fallback simulation so the UI doesn't look broken
    return `[OFFLINE MODE] Connection to Nexus Core at ${CORE_URL} failed.\n\nSimulated response from ${module.name}:\n"I received your message: '${userMessage}'. Access to real system tools is currently unavailable. Please start the Node.js backend to enable full autonomy."`;
  }
};

/**
 * Triggers a real Blueprint Generation & Execution pipeline on the Backend.
 */
export const generateBlueprint = async (intention: string): Promise<string> => {
   try {
    const response = await fetch(`${CORE_URL}/nexus/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: intention,
        origin: "UI_PIPELINE",
        pipeline: "pipeline_default"
      })
    });

    if (!response.ok) throw new Error("Backend unavailable");

    const data = await response.json();
    
    const razorTrace = data.trace?.find((t: any) => t.agent === "RAZOR");
    
    if (razorTrace && razorTrace.success) {
      const plan = razorTrace.output;
      const uiBlueprint = {
        concept: plan.analysis || "System Analysis",
        conscience: "Automated Risk Assessment: " + (plan.risk_level || "CALCULATED"),
        construction: {
          agents_required: plan.stages?.flatMap((s: any) => s.tasks.map((t: any) => t.agent)) || ["BELSEBUTH"],
          steps: plan.stages?.flatMap((s: any) => s.tasks.map((t: any) => t.description)) || ["Execution"],
          tech_stack: ["Node.js", "Supabase", "Nexus Core"]
        }
      };
      return JSON.stringify(uiBlueprint);
    }

    return JSON.stringify({
      concept: "Execution Started",
      conscience: "Processing in background...",
      construction: {
        status: data.status,
        executionId: data.executionId
      }
    });

  } catch (error) {
    console.error("Blueprint Error:", error);
    // Return a dummy blueprint so the UI flow continues
    return JSON.stringify({
        concept: "OFFLINE BLUEPRINT",
        conscience: "Backend unreachable. Displaying simulation.",
        construction: {
            agents_required: ["SIMULATION_AGENT"],
            steps: ["Backend connection failed", "Check terminal", "npm start"],
            tech_stack: ["Simulation"]
        }
    });
  }
}