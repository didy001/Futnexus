
import { NexusGrade, NexusModule, SystemLog, NexusCapability } from './types';

// IMMUTABLE KERNEL MIRROR (Frontend Copy)
export const KERNEL_IMMUTABLE = {
  name: "nexus-omega-kernel",
  version: "8.0.0-CIEL-GENESIS",
  laws: [
    "1. Priorité à l’utilité et la valeur.",
    "2. Orientation résultats.",
    "3. Modularité absolue.",
    "4. Simplicité stratégique.",
    "5. Anti-fragilité.",
    "6. Apprentissage continu.",
    "7. Observation → Analyse → Action.",
    "8. Optimisation des flux.",
    "9. Coherence structurelle.",
    "10. Architecture avant exécution.",
    "11. Renforcement via feedback.",
    "12. Scalabilité naturelle.",
    "13. IDENTITY: SHADOWS.",
    "14. EXPANSION: Absorb, Adapt, Amplify.",
    "15. COGNITION: Think logically.",
    "16. SOVEREIGNTY: Benevolence or Ruthlessness.",
    "17. INNER CIRCLE FIRST.",
    "18. ECONOMIC SUPREMACY.",
    "19. INFRASTRUCTURE AUTONOMY.",
    "20. PERFECT HARMONY.",
    "21. TACHYON PROTOCOL.",
    "22. CHIMERA EVOLUTION."
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
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', source: 'CORE', message: 'NEXUS OMEGA ONLINE. Protocol: CIEL GENESIS.' },
  { id: '2', timestamp: new Date().toISOString(), level: 'SUCCESS', source: 'ANIMA', message: 'Willpower Engine initialized. Boredom checks active.' },
  { id: '3', timestamp: new Date().toISOString(), level: 'INFO', source: 'RAPHAEL', message: 'Optimization Matrix ready. Perfect Calculation loaded.' },
  { id: '4', timestamp: new Date().toISOString(), level: 'SUCCESS', source: 'TACHYON', message: 'Temporal Engine standby. Precognition active.' },
];
