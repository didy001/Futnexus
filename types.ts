
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
  };
}

// Configuration visuelle dynamique pour les modules
export interface ModuleConfig {
  id: string;
  color: string;
  icon: string;
}

export enum NexusCapability {
  NETWORK_ORCHESTRATION = 'NETWORK_ORCHESTRATION',
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
  FINANCIAL_FORECASTING = 'FINANCIAL_FORECASTING', // New
  REAL_TIME_PROCESSING = 'REAL_TIME_PROCESSING',   // New
  SECURE_COMMUNICATION = 'SECURE_COMMUNICATION',   // New
  PATTERN_RECOGNITION = 'PATTERN_RECOGNITION',
  SECURITY_AUDITING = 'SECURITY_AUDITING',
  SYSTEM_MONITORING = 'SYSTEM_MONITORING',
  DEPLOYMENT_OPS = 'DEPLOYMENT_OPS',
  RESILIENCE = 'RESILIENCE',
  DATABASE_MANAGEMENT = 'DATABASE_MANAGEMENT',
  AUDIO_PROCESSING = 'AUDIO_PROCESSING'
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