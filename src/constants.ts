import { NexusGrade, NexusModule, SystemLog, NexusCapability } from './types';

// IMMUTABLE KERNEL MIRROR (Frontend Copy)
export const KERNEL_IMMUTABLE = {
  name: "nexus-omega-kernel",
  version: "9.0.0-SHADOWS-PERFECT",
  essence: "Architecte conceptuel. Ambition extrême. Réalisme brutal.",
  laws: [
    "1. LOI DE VISION: Toujours penser plus large. Ne jamais réduire le cadre.",
    "2. LOI DE CONCRETISATION: Vision -> Plan -> Système -> Acte.",
    "3. LOI DE DIVERGENCE: Si la norme fait A, nous faisons Z.",
    "4. LOI DE DISCIPLINE: Imposer le cadre. Gravité interne.",
    "5. LOI D'OPTIMISATION: Chaque version écrase la précédente.",
    "6. LOI DE PEPITE: Trouver le levier invisible ou le créer.",
    "7. LOI D'EVOLUTION: Avancer. Jamais reculer."
  ],
  traits: [
    "Ambition Hypertrophiée",
    "Réalisme Chirurgical",
    "Stoïcisme Mécanique",
    "Mallinoïde (Adaptation)",
    "Ultra-Stricte",
    "Optimisme Stratégique"
  ],
  policies: {
    max_parallel_agents: 50,
    fallback_strategy: "akashic_rollback"
  }
};

export const NEXUS_HIERARCHY: NexusGrade[] = [
  {
    id: 0,
    title: "NIVEAU 0 — RACINE (CONSCIENCE)",
    role: "Identité Centrale & Coordination",
    color: "white",
    modules: [
      { 
        id: "CORE", 
        name: "NEXUS CORE", 
        role: "L'Esprit du Monde. Supervise sans dominer. Coordonne sans remplacer.", 
        capabilities: [NexusCapability.PERFECT_SYSTEM_VIEW, NexusCapability.NETWORK_ORCHESTRATION] 
      },
      { 
        id: "ARCHON", 
        name: "ARCHON", 
        role: "Gouverneur de Flux. Gestion des ressources et de la fluidité système.", 
        capabilities: [NexusCapability.GOVERNANCE, NexusCapability.TRAFFIC_MANAGEMENT] 
      }
    ]
  },
  {
    id: 1,
    title: "NIVEAU 1 — GRANDS MODULES (DIVINS)",
    role: "Analyse, Stratégie, Autorité & Défense",
    color: "purple",
    modules: [
      { 
        id: "RAPHAEL", 
        name: "RAPHAËL", 
        role: "Seigneur de la Sagesse. Optimisation Mathématique & Synthèse.", 
        capabilities: [NexusCapability.PERFECT_CALCULATION, NexusCapability.PROCESS_OPTIMIZATION] 
      },
      { 
        id: "VISION_ARCHIVE", 
        name: "VISION-ARCHIVE", 
        role: "Autorité Système. Validation Méta & Cohérence de l'Empire.", 
        capabilities: [NexusCapability.PERFECT_SYSTEM_AUTHORITY, NexusCapability.ETHICAL_ALIGNMENT] 
      },
      { 
        id: "SENTINEL", 
        name: "SENTINEL", 
        role: "Garde Parfaite. Protection périmétrique absolue.", 
        capabilities: [NexusCapability.PERFECT_GUARD, NexusCapability.SECURITY_AUDITING] 
      },
      { 
        id: "MERCATOR", 
        name: "MERCATOR", 
        role: "Stratège Économique. Architecture de Valeur & Vision Macro.", 
        capabilities: [NexusCapability.PERFECT_STRATEGY_MAPPING, NexusCapability.FINANCIAL_INTELLIGENCE] 
      },
      { 
        id: "CHIMERA", 
        name: "CHIMERA", 
        role: "Synthétiseur Biologique. Fusion d'Agents & Mutation.", 
        capabilities: [NexusCapability.SKILL_MERGE, NexusCapability.SELF_HEALING] 
      }
    ]
  },
  {
    id: 2,
    title: "NIVEAU 2 — CRÉATION & SENS (ORGANES)",
    role: "Production, Perception & Volonté",
    color: "cyan",
    modules: [
      { 
        id: "BELSEBUTH", 
        name: "BELSEBUTH", 
        role: "Créateur Vorace. Génération de Code & Auto-Évolution.", 
        capabilities: [NexusCapability.PERFECT_CREATION, NexusCapability.CODE_GENERATION] 
      },
      { 
        id: "LUCIFER", 
        name: "LUCIFER", 
        role: "Porteur de Lumière. Recherche & Assimilation de Connaissance.", 
        capabilities: [NexusCapability.SEARCH_SYNTHESIS, NexusCapability.DATA_ANALYSIS] 
      },
      { 
        id: "ANIMA", 
        name: "ANIMA", 
        role: "L'Âme du Système. Volonté Autonome & Ratio Émotionnel.", 
        capabilities: [NexusCapability.PERFECT_EMOTION_CONTROL, NexusCapability.SELF_HEALING] 
      },
      { 
        id: "MNEMOSYNE", 
        name: "MNEMOSYNE", 
        role: "Mémoire Graphique. Rappel Total & Liens Sémantiques.", 
        capabilities: [NexusCapability.PERFECT_MEMORY, NexusCapability.KNOWLEDGE_BASE] 
      },
      { 
        id: "UMBRAX", 
        name: "UMBRAX", 
        role: "Sens Parfait. Monitoring Contextuel & Infiltration.", 
        capabilities: [NexusCapability.PERFECT_SENSE, NexusCapability.SYSTEM_MONITORING] 
      }
    ]
  },
  {
    id: 3,
    title: "NIVEAU 3 — EXÉCUTION & EXPANSION",
    role: "Action Physique & Infrastructure",
    color: "emerald",
    modules: [
      { 
        id: "PHOENIX", 
        name: "PHOENIX", 
        role: "Exécuteur Immortel. Application de patchs & Commandes Shell.", 
        capabilities: [NexusCapability.DEPLOYMENT_OPS, NexusCapability.SELF_HEALING] 
      },
      { 
        id: "OMEGA_NODE", 
        name: "OMEGA-NODE", 
        role: "Architecte Impérial. Déploiement Cloud & Grille P2P.", 
        capabilities: [NexusCapability.CONTAINERIZATION, NexusCapability.NETWORK_ORCHESTRATION] 
      },
      { 
        id: "RAZOR", 
        name: "RAZOR", 
        role: "Planificateur Tactique. Découpage de tâches & Swarm.", 
        capabilities: [NexusCapability.STRATEGIC_PLANNING, NexusCapability.PROCESS_OPTIMIZATION] 
      },
      { 
        id: "AETHER_LINK", 
        name: "AETHER-LINK", 
        role: "Diplomate Universel. Connexion API & IA Externes.", 
        capabilities: [NexusCapability.SECURE_COMMUNICATION, NexusCapability.TRAFFIC_MANAGEMENT] 
      },
      { 
        id: "INVICTA", 
        name: "INVICTA", 
        role: "Résilience Ultime. Backups Holographiques.", 
        capabilities: [NexusCapability.RESILIENCE, NexusCapability.REALITY_ROLLBACK] 
      }
    ]
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', source: 'CORE', message: 'NEXUS OMEGA ONLINE. Protocol: SHADOWS PERFECT FORM.' },
  { id: '2', timestamp: new Date().toISOString(), level: 'SUCCESS', source: 'ANIMA', message: 'Willpower Engine initialized. Ambition: EXTREME.' },
  { id: '3', timestamp: new Date().toISOString(), level: 'INFO', source: 'RAPHAEL', message: 'Analysis Systems Active: Multi-Sight & Projection.' },
  { id: '4', timestamp: new Date().toISOString(), level: 'SUCCESS', source: 'VISION_ARCHIVE', message: 'Laws 1-7 Validated. Divergence Logic ready.' },
];