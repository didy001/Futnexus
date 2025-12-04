import logger from './logger.js';

class RealTimeCortex {
  constructor() {
    this.io = null;
  }

  init(ioInstance) {
    this.io = ioInstance;
    logger.info('[REALTIME CORTEX] 🧠 Nervous System Initialized.');
  }

  /**
   * Broadcasts a thought, log, or signal to all connected neural interfaces (Frontend).
   */
  emit(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Broadcasts a live log entry immediately.
   */
  emitLog(logEntry) {
    this.emit('log_stream', logEntry);
  }

  /**
   * Broadcasts the current execution trace step of an agent.
   */
  emitTrace(agentName, stepData) {
    this.emit('agent_trace', { agent: agentName, step: stepData, timestamp: new Date() });
  }
}

export const realTimeCortex = new RealTimeCortex();