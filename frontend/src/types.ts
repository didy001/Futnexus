
// Types synchronisés avec le Backend Node.js

export interface NexusMetrics {
  uptime: number;
  memory_rss: number;
  active_agents: number;
  knowledge_nodes: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS' | 'ERROR';
  source: string;
  message: string;
}

export interface NexusStatus {
  status: 'ONLINE' | 'OFFLINE';
  version: string;
  metrics: NexusMetrics;
  logs: SystemLog[];
}

export interface AgentResponse {
  role: 'model' | 'system';
  content: string;
  meta?: {
    intent?: string;
    files?: Array<{ path: string; content: string }>;
    risk_score?: number;
    traceId?: string;
    source?: string;
  };
}

// Configuration visuelle dynamique pour les modules
export interface ModuleConfig {
  id: string;
  color: string;
  icon: string;
}

export enum NexusCapability {
  // --- PERFECT SKILLS (ISEKAI TIER) ---
  PERFECT_CALCULATION = 'PERFECT_CALCULATION',      // Raphael
  PERFECT_SYSTEM_VIEW = 'PERFECT_SYSTEM_VIEW',      // Core
  PERFECT_STRATEGY_MAPPING = 'PERFECT_STRATEGY_MAPPING', // Razor
  PERFECT_GUARD = 'PERFECT_GUARD',                  // Sentinel
  PERFECT_SYSTEM_AUTHORITY = 'PERFECT_SYSTEM_AUTHORITY', // Vision
  PERFECT_SENSE = 'PERFECT_SENSE',                  // Sensor
  PERFECT_CREATION = 'PERFECT_CREATION',            // Belsebuth
  PERFECT_MEMORY = 'PERFECT_MEMORY',                // Mnemosyne
  PERFECT_EMOTION_CONTROL = 'PERFECT_EMOTION_CONTROL', // Anima
  
  // --- MONSTER SKILLS (GOD MODE) ---
  SKILL_MERGE = 'SKILL_MERGE',                      // Chimera
  PRECOGNITION = 'PRECOGNITION',                    // Tachyon
  REALITY_ROLLBACK = 'REALITY_ROLLBACK',            // Akashic

  // --- STANDARD CAPABILITIES ---
  NETWORK_ORCHESTRATION = 'NETWORK_ORCHESTRATION',
  WORKFLOW_MANAGEMENT = 'WORKFLOW_MANAGEMENT', // New
  SELF_HEALING = 'SELF_HEALING',
  DEEP_LEARNING = 'DEEP_LEARNING',
  SCENARIO_SIMULATION = 'SCENARIO_SIMULATION',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  ETHICAL_ALIGNMENT = 'ETHICAL_ALIGNMENT',
  GOVERNANCE = 'GOVERNANCE',
  DECISION_ARBITRAGE = 'DECISION_ARBITRAGE',
  CONTAINERIZATION = 'CONTAINERIZATION',
  CODE_GENERATION = 'CODE_GENERATION',
  SEARCH_SYNTHESIS = 'SEARCH_SYNTHESIS',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  PROCESS_OPTIMIZATION = 'PROCESS_OPTIMIZATION',
  STRATEGIC_PLANNING = 'STRATEGIC_PLANNING',
  TRAFFIC_MANAGEMENT = 'TRAFFIC_MANAGEMENT',
  PREDICTION = 'PREDICTION',
  FINANCIAL_INTELLIGENCE = 'FINANCIAL_INTELLIGENCE',
  FINANCIAL_FORECASTING = 'FINANCIAL_FORECASTING',
  REAL_TIME_PROCESSING = 'REAL_TIME_PROCESSING',
  SECURE_COMMUNICATION = 'SECURE_COMMUNICATION',
  PATTERN_RECOGNITION = 'PATTERN_RECOGNITION',
  SECURITY_AUDITING = 'SECURITY_AUDITING',
  SYSTEM_MONITORING = 'SYSTEM_MONITORING',
  DEPLOYMENT_OPS = 'DEPLOYMENT_OPS',
  RESILIENCE = 'RESILIENCE',
  DATABASE_MANAGEMENT = 'DATABASE_MANAGEMENT',
  AUDIO_PROCESSING = 'AUDIO_PROCESSING',
  ACCOUNTING = 'ACCOUNTING'
}

export interface NexusModule {
  id: string;
  name: string;
  role: string;
  capabilities: NexusCapability[];
}

export interface NexusGrade {
  id: number;
  title: string;
  role: string;
  color: string;
  modules: NexusModule[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  sender?: string;
}

// Global App State Extension
export interface UIState {
    domainExpansion: boolean; // TRUE = ZEN MODE / GOD MODE
    themeMode: 'DEFAULT' | 'WAR' | 'GOLD' | 'VOID';
}
