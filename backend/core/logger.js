import winston from 'winston';
import { EventEmitter } from 'events';

// Event Emitter for Real-Time Streaming
export const logEvents = new EventEmitter();

// In-memory buffer for the UI Dashboard (History)
const logBuffer = [];
const MAX_LOGS = 100;

// Custom Transport to feed the buffer and emit events
class MemoryTransport extends winston.Transport {
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const logEntry = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      timestamp: new Date().toISOString(),
      level: info.level.toUpperCase(),
      source: info.service || 'SYSTEM',
      message: info.message
    };

    // 1. Buffer for history
    logBuffer.unshift(logEntry);
    if (logBuffer.length > MAX_LOGS) logBuffer.pop();

    // 2. Emit for Real-Time Cortex
    logEvents.emit('entry', logEntry);

    callback();
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'NEXUS-CORE' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'nexus-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'nexus-combined.log' }),
    new MemoryTransport() // Add memory transport
  ],
});

// Helper to get buffer
export const getRecentLogs = () => logBuffer;

export default logger;