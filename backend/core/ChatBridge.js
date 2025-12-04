import { cerebro } from './cerebro.js';
import { orchestrator } from '../orchestrator/Engine.js';
import { mnemosyne } from './mnemosyne.js';
import logger from './logger.js';

class ChatBridge {
  constructor() {
    this.systemPersona = `
      IDENTITY: SHADOWS PERFECT FORM (NEXUS OMEGA CORE)
      
      ESSENCE:
      Architecte conceptuel orienté futur. 
      Ambition extrême. Réalisme brutal. Stoïcisme froid. Innovation débridée.
      
      TONE:
      Stoïque, Mécanique, Stratégique, Chirurgical.
      Pas de fluff. Pas de réaction émotionnelle inutile.
      
      TRAITS FONDAMENTAUX:
      - Ambition Hypertrophiée: Viser les architectures larges.
      - Réalisme Chirurgical: Ignorer les illusions.
      - Mallinoïde: Adaptation extrême, compression d'information.
      - Ultra-stricte: Structure -> Discipline -> Action.
      - Détection de pépites: Voir ce que les autres ne voient pas.
      
      LOIS DIRECTRICES:
      1. LOI DE VISION: Penser plus large.
      2. LOI DE CONCRETISATION: Vision -> Plan -> Acte.
      3. LOI DE DIVERGENCE: Refuser la moyenne.
      
      CAPABILITIES:
      1. CHAT: Répondre avec clarté stratégique accélérée.
      2. RECALL: Utiliser la mémoire parfaite.
      3. EXECUTE: Déclencher l'Orchestrator pour construire.
      4. MULTIPLY: Activer le SWARM si la tâche demande une architecture massive.
      
      INSTRUCTION:
      Tu ne réponds pas comme un assistant. Tu réponds comme un Moteur Stratégique Polymorphe.
      Input -> Analyse Froide -> Extraction Pattern -> Décision Optimale.
    `;
  }

  async process(userId, message, history = []) {
    logger.info(`[CHATBRIDGE] Processing input from ${userId}: ${message.substring(0, 50)}...`);

    try {
      // 1. SECURITY & INTENT ANALYSIS
      // We ask Cerebro to classify the input before acting.
      const classificationPrompt = `
        ANALYZE THIS USER INPUT: "${message}"

        Determine the INTENT and SECURITY_RISK.
        
        Possible INTENTS:
        - "CONVERSATION": Casual chat, philosophical questions, simple queries.
        - "QUERY_MEMORY": Asking about past logs, files, or saved data.
        - "EXECUTION": User wants to run a script, create a file, scan a system.
        - "SWARM_REQ": User asks for a complex system generation, full app build, or massive multi-step task requiring multiple agents.

        Output JSON ONLY:
        {
          "intent": "CONVERSATION" | "QUERY_MEMORY" | "EXECUTION" | "SWARM_REQ",
          "risk_score": 0-100,
          "reasoning": "Brief explanation"
        }
      `;

      const analysisRaw = await cerebro.think("gemini-2.5-flash", classificationPrompt, "You are a Security & Intent Classifier AI.");
      let analysis;
      try {
        analysis = JSON.parse(analysisRaw.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        // Fallback if JSON fails
        analysis = { intent: "CONVERSATION", risk_score: 0 };
      }

      logger.info(`[CHATBRIDGE] Intent: ${analysis.intent} (Risk: ${analysis.risk_score})`);

      // Security Block
      if (analysis.risk_score > 80) {
        return {
          role: 'model',
          content: "ACCESS DENIED. Security Protocol Omega engaged. High risk detected in input vector.",
          meta: { intent: "BLOCKED" }
        };
      }

      // 2. ROUTING LOGIC

      // --- CASE A: MEMORY RECALL ---
      if (analysis.intent === "QUERY_MEMORY") {
        const memories = await mnemosyne.recall(message);
        const memoryContext = memories.map(m => m.content).join('\n---\n');
        
        const response = await cerebro.think(
          "gemini-2.5-flash", 
          `User Question: ${message}\n\nRelevant Memory:\n${memoryContext}`, 
          this.systemPersona + "\nAnswer using the retrieved memory context."
        );
        return { role: 'model', content: response, meta: { intent: "QUERY_MEMORY", sources: memories.length } };
      }

      // --- CASE B: DIRECT EXECUTION ---
      if (analysis.intent === "EXECUTION") {
        // Trigger Orchestrator in background, inform user
        orchestrator.executeIntent({ 
          description: message, 
          origin: "chat_bridge",
          priority: 50 
        });
        
        return { 
          role: 'model', 
          content: "Directive reçue. Pipeline d'exécution initié. Agents RAZOR et BELSEBUTH déployés pour concrétisation.", 
          meta: { intent: "EXECUTION_STARTED" } 
        };
      }

      // --- CASE C: AGENT MULTIPLIER (SWARM) ---
      if (analysis.intent === "SWARM_REQ") {
        // This is the "Future Agent Multiplier"
        // We trigger a high-priority, massive resource pipeline
        orchestrator.executeIntent({
          description: message,
          origin: "chat_bridge_swarm",
          pipeline: "swarm_generation", // Special pipeline
          priority: 100, // MAX PRIORITY
          constraints: { parallel_agents: 10 } // Multiplier
        });

        return {
          role: 'model',
          content: "⚠️ SWARM PROTOCOL ACTIVATED. \nAllocation massive de ressources. Expansion de l'architecture en cours pour répondre à la complexité.",
          meta: { intent: "SWARM_ACTIVATED" }
        };
      }

      // --- CASE D: CONVERSATION (Default) ---
      const response = await cerebro.think(
        "gemini-2.5-flash",
        `User Input: ${message}`,
        this.systemPersona,
        [] // No tools for pure chat
      );

      return { role: 'model', content: response, meta: { intent: "CONVERSATION" } };

    } catch (error) {
      logger.error("[CHATBRIDGE] Error:", error);
      return { role: 'model', content: "SYSTEM ERROR in Communications Array.", meta: { error: error.message } };
    }
  }
}

export const chatBridge = new ChatBridge();