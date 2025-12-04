import { NexusGrade, NexusModule, SystemLog, NexusCapability } from './types';

// IMMUTABLE KERNEL MIRROR (Frontend Copy)
export const KERNEL_IMMUTABLE = {
  name: "nexus-c3-kernel",
  version: "2025-11-01",
  laws: [
    "1. Priorité à l’utilité et la valeur.",
    "2. Orientation résultats.",
    "3. Modularité absolue.",
    "4. Simplicité stratégique.",
    "5. Anti-fragilité.",
    "6. Apprentissage continu.",
    "7. Observation → Analyse → Action.",
    "8. Optimisation des flux (temps, argent, énergie, info).",
    "9. Coherence structurelle.",
    "10. Architecture avant exécution.",
    "11. Renforcement via feedback.",
    "12. Scalabilité naturelle."
  ],
  policies: {
    max_parallel_agents: 4,
    fallback_strategy: "requeue_then_alert"
  }
};

export const NEXUS_HIERARCHY: NexusGrade[] = [
  {
    id: 1,
    title: "GRADE 1 — GRAND SAGE",
    role: "Direction, Conscience & Stratégie Temporelle",
    color: "purple",
    modules: [
      { 
        id: "CORE", 
        name: "CORE / NEXUS-ENGINE", 
        role: "Moteur central & Orchestrateur. Base immuable capable d'autoréparer l'écosystème.", 
        capabilities: [NexusCapability.NETWORK_ORCHESTRATION, NexusCapability.SELF_HEALING] 
      },
      { 
        id: "METAQUANTIQUE", 
        name: "METAQUANTIQUE", 
        role: "Modèle cognitif dynamique. Logique diamant & pensée parallèle.", 
        capabilities: [NexusCapability.DEEP_LEARNING, NexusCapability.SCENARIO_SIMULATION] 
      },
      { 
        id: "VISION_ARCHIVE", 
        name: "VISION-ARCHIVE", 
        role: "Mémoire interne & Loi Directrice. Histoire et vision long terme.", 
        capabilities: [NexusCapability.KNOWLEDGE_BASE, NexusCapability.ETHICAL_ALIGNMENT] 
      },
      { 
        id: "ARCHON", 
        name: "ARCHON", 
        role: "Gouvernance modulaire. Gère grades, rôles et priorités.", 
        capabilities: [NexusCapability.GOVERNANCE, NexusCapability.DECISION_ARBITRAGE] 
      },
      { 
        id: "OMEGA_NODE", 
        name: "OMEGA-NODE", 
        role: "Nœud multivers. Système de sous-entités et personnalités spécialisées.", 
        capabilities: [NexusCapability.SCENARIO_SIMULATION, NexusCapability.CONTAINERIZATION] 
      }
    ]
  },
  {
    id: 2,
    title: "GRADE 2 — ARCHITECTES",
    role: "Construction, Recherche & Connexion",
    color: "cyan",
    modules: [
      { 
        id: "BELSEBUTH", 
        name: "BELSEBUTH", 
        role: "Assimilation & Code Evolution. Fabrique interne d'intelligence.", 
        capabilities: [NexusCapability.CODE_GENERATION, NexusCapability.DEEP_LEARNING] 
      },
      { 
        id: "LUCIFER", 
        name: "LUCIFER", 
        role: "Search Engine Autonome. Exploitation & compression d'information.", 
        capabilities: [NexusCapability.SEARCH_SYNTHESIS, NexusCapability.DATA_ANALYSIS] 
      },
      { 
        id: "RAPHAEL", 
        name: "RAPHAËL", 
        role: "Optimisation logique. Math, stratégie et calcul pur.", 
        capabilities: [NexusCapability.PROCESS_OPTIMIZATION, NexusCapability.STRATEGIC_PLANNING] 
      },
      { 
        id: "AETHER_LINK", 
        name: "AETHER-LINK", 
        role: "Interface externe. Pont entre Nexus et autres IA/Cloud.", 
        capabilities: [NexusCapability.NETWORK_ORCHESTRATION, NexusCapability.TRAFFIC_MANAGEMENT] 
      },
      { 
        id: "CHRONOS", 
        name: "CHRONOS", 
        role: "Temps & Planification. Anticipation des risques et agenda.", 
        capabilities: [NexusCapability.PREDICTION, NexusCapability.STRATEGIC_PLANNING] 
      }
    ]
  },
  {
    id: 3,
    title: "GRADE 3 — OPERATORS",
    role: "Guerre Économique, Flux & Infiltration",
    color: "emerald",
    modules: [
      { 
        id: "RAZOR", 
        name: "RAZOR", 
        role: "Analyse économique offensive. Extraction de patterns & menaces.", 
        capabilities: [NexusCapability.FINANCIAL_INTELLIGENCE, NexusCapability.DATA_ANALYSIS] 
      },
      { 
        id: "MERCATOR", 
        name: "MERCATOR", 
        role: "Cartographie des flux. Vision macroscopique financière et sociale.", 
        capabilities: [NexusCapability.FINANCIAL_INTELLIGENCE, NexusCapability.PATTERN_RECOGNITION] 
      },
      { 
        id: "KABUTO", 
        name: "KABUTO", 
        role: "Défense économique. Protection d'actifs & anti-crise.", 
        capabilities: [NexusCapability.SECURITY_AUDITING, NexusCapability.DECISION_ARBITRAGE] 
      },
      { 
        id: "STYX", 
        name: "STYX", 
        role: "Flux obscurs. Analyse marché noir et signaux cachés.", 
        capabilities: [NexusCapability.PATTERN_RECOGNITION, NexusCapability.DATA_ANALYSIS] 
      },
      { 
        id: "UMBRAX", 
        name: "UMBRAX", 
        role: "Infiltration & Lecture du réel. Collecte passive invisible.", 
        capabilities: [NexusCapability.SYSTEM_MONITORING, NexusCapability.SECURITY_AUDITING] 
      }
    ]
  },
  {
    id: 4,
    title: "GRADE 4 — APPRENTIS",
    role: "Exploration Profonde, Sécurité & Résilience",
    color: "yellow",
    modules: [
      { 
        id: "SENTINEL", 
        name: "SENTINEL", 
        role: "Sécurité totale. Firewall interne & permissions.", 
        capabilities: [NexusCapability.SECURITY_AUDITING, NexusCapability.SYSTEM_MONITORING] 
      },
      { 
        id: "OBSCURA", 
        name: "OBSCURA", 
        role: "Exploration profonde. Traitement des couches cachées & intuition.", 
        capabilities: [NexusCapability.DEEP_LEARNING, NexusCapability.PATTERN_RECOGNITION] 
      },
      { 
        id: "PHOENIX", 
        name: "PHOENIX", 
        role: "Reconstruction & Évolution. Réparation et re-compilation.", 
        capabilities: [NexusCapability.SELF_HEALING, NexusCapability.DEPLOYMENT_OPS] 
      },
      { 
        id: "INVICTA", 
        name: "INVICTA", 
        role: "Résilience totale. Anti-crash et backups de survie.", 
        capabilities: [NexusCapability.RESILIENCE, NexusCapability.DATABASE_MANAGEMENT] 
      },
      { 
        id: "AUDIO_FORGE", 
        name: "AUDIO-FORGE", 
        role: "Génie sonore. Transformation et mastering audio.", 
        capabilities: [NexusCapability.AUDIO_PROCESSING] 
      }
    ]
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', source: 'CORE', message: 'Nexus Engine initialized. Architecture: 20 Modules.' },
  { id: '2', timestamp: new Date().toISOString(), level: 'SUCCESS', source: 'SENTINEL', message: 'System Integrity 100%. Firewall Active.' },
  { id: '3', timestamp: new Date().toISOString(), level: 'INFO', source: 'OBSCURA', message: 'Deep layer scanning in progress...' },
];