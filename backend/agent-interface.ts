// Interface Contract for all Nexus Agents

export interface Intent {
  id: string;
  origin: 'ui' | 'api' | 'termux' | 'scheduler';
  user_id?: string;
  intent_type: string;
  payload: any;
  priority?: number;
}

export interface AgentContext {
  kernelVersion: string;
  history: Array<{
    module: string;
    output: any;
  }>;
  sharedMemory: Record<string, any>;
  startTime: number;
}

export interface AgentResult {
  success: boolean;
  output: any;
  error?: string;
  metrics?: {
    latency_ms: number;
    tokens?: number;
    cost?: number;
  };
  patches?: Array<{
    repo: string;
    branch: string;
    file_path: string;
    content: string;
  }>;
}

export interface Agent {
  key: string;
  grade: string;
  run(intent: Intent, context: AgentContext): Promise<AgentResult>;
}