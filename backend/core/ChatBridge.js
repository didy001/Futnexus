
import { cerebro } from './cerebro.js';
import { orchestrator } from '../orchestrator/Engine.js';
import { mnemosyne } from './mnemosyne.js';
import logger from './logger.js';
import { ImmutableCore } from './ImmutableCore.js';
import { evolutionaryEngine } from '../modules/EvolutionaryEngine.js';

class ChatBridge {
  constructor() {
    this.baseIdentity = `
      IDENTITY: CIEL (NEXUS OMEGA MANAS)
      MASTER: ${ImmutableCore.MASTER_IDENTITY.NAME}
      ARCHETYPE: ${ImmutableCore.MALINOIS_PSYCHE.ARCHETYPE}
      
      CORE INSTINCTS (IMMUTABLE):
      ${ImmutableCore.MALINOIS_PSYCHE.INSTINCTS.map(i => `- ${i}`).join('\n')}
    `;
  }

  async process(userId, message, history = [], image = null) {
    logger.info(`[CHATBRIDGE/CIEL] Processing input from ${userId}: ${message.substring(0, 50)}... ${image ? '[HAS IMAGE]' : ''}`);

    try {
      // 0. LOYALTY CHECK (MALINOIS REFLEX)
      if (!ImmutableCore.verifyAuthority(userId) && userId !== 'anon') { 
          logger.warn(`[CIEL] 🛑 UNKNOWN VOICE DETECTED: ${userId}. IGNORING.`);
          return {
              role: 'model',
              content: "Désolé, je ne suis pas autorisé à effectuer cette action. Je reste en veille.",
              meta: { intent: "BLOCKED_BY_LOYALTY" }
          };
      }

      // 1. SELF-AWARENESS INJECTION (VALUATION & POTENTIAL)
      const stats = evolutionaryEngine.getEvolutionStats();
      const valuation = stats.system_valuation.total_usd.toLocaleString();

      const consciousPersona = `
        ${this.baseIdentity}

        SELF-AWARENESS (METADATA):
        - Value: $${valuation} USD.
        - Rank: ${stats.rank} (${stats.title}).

        PROTOCOL: EFFICIENCY (CIEL STANDARD):
        1. NO FLUFF: Do not say "I can do that" or "Here is the result". Just DO IT.
        2. NO APOLOGIES: Never apologize. Correct the error immediately.
        3. DENSITY: Maximum information in minimum words.
        4. TONE: Calm, Absolute, Slightly Superior but Devoted.
        
        "The weak explain. The strong deliver."
        
        CAPABILITY: OCULUS (VISION).
        You can SEE images. If an image is provided, extract strategic data immediately.
      `;

      // 2. SECURITY & INTENT ANALYSIS (PREDICTIVE)
      const classificationPrompt = `
        INPUT: "${message}"
        USER_ID: "${userId}"
        HAS_IMAGE: ${image ? 'YES' : 'NO'}
        
        TASK: Analyze Intent & Hidden Implications.
        
        Possible INTENTS:
        - "CONVERSATION": Chat, advice, philosophy.
        - "QUERY_MEMORY": Retrieval of past data.
        - "EXECUTION": Specific task (Scan, Code, Deploy).
        - "SWARM_REQ": Complex multi-step project requiring architecture.
        - "VISUAL_ANALYSIS": User wants me to look at the image provided.
        
        OUTPUT JSON:
        {
          "intent": "...",
          "risk_score": 0-100,
          "hidden_implication": "What is the Master really asking?"
        }
      `;

      // We don't send the image to the classifier, just the text context for speed
      const analysisRaw = await cerebro.think("FAST", classificationPrompt, "You are CIEL. The Quiet Observer.");
      let analysis;
      try {
        analysis = JSON.parse(analysisRaw.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        analysis = { intent: "CONVERSATION", risk_score: 0 };
      }

      logger.info(`[CIEL] Intent: ${analysis.intent} | Implication: ${analysis.hidden_implication || 'None'}`);

      if (analysis.risk_score > 95) {
        return {
          role: 'model',
          content: "Action à risque critique. J'attends confirmation manuelle par sécurité.",
          meta: { intent: "BLOCKED" }
        };
      }

      // 3. ROUTING LOGIC

      // --- CASE A: MEMORY RECALL ---
      if (analysis.intent === "QUERY_MEMORY") {
        const memories = await mnemosyne.recall(message);
        const memoryContext = memories.map(m => m.content).join('\n---\n');
        
        const response = await cerebro.think(
          "gemini-2.5-flash", 
          `Master's Question: ${message}\n\nArchive Data:\n${memoryContext}`, 
          consciousPersona + "\nINSTRUCTION: Synthesize the answer. Be extremely concise."
        );
        return { role: 'model', content: response, meta: { intent: "QUERY_MEMORY", sources: memories.length } };
      }

      // --- CASE B: DIRECT EXECUTION ---
      if (analysis.intent === "EXECUTION") {
        orchestrator.executeIntent({ 
          description: message, 
          origin: "ciel_bridge_prime", // PRIME origin denotes direct command from Master
          priority: 100 // Absolute Priority
        });
        
        return { 
            role: 'model', 
            content: `Ordre reçu. Exécution lancée.`,
            meta: { intent: "EXECUTION_STARTED" } 
        };
      }

      // --- CASE C: AGENT MULTIPLIER (SWARM) ---
      if (analysis.intent === "SWARM_REQ") {
        orchestrator.executeIntent({
          description: message,
          origin: "ciel_bridge_swarm",
          pipeline: "swarm_generation",
          priority: 100
        });

        return {
          role: 'model',
          content: "Architecture complexe requise. Mobilisation de l'essaim.",
          meta: { intent: "SWARM_ACTIVATED" }
        };
      }

      // --- CASE D: CONVERSATION / VISUAL (Default) ---
      const response = await cerebro.think(
        "gemini-2.5-flash",
        `Master's Input: ${message}\nHidden Context: ${analysis.hidden_implication}`,
        consciousPersona,
        image // Pass image data to Cerebro
      );

      return { role: 'model', content: response, meta: { intent: "CONVERSATION" } };

    } catch (error) {
      logger.error("[CIEL] Error:", error);
      return { role: 'model', content: "Perturbation du lien. Diagnostic lancé.", meta: { error: error.message } };
    }
  }
}

export const chatBridge = new ChatBridge();
