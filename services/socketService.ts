import { io, Socket } from 'socket.io-client';
import { NexusStatus, SystemLog } from '../types';

const CORE_URL = "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private statusCallback: ((status: NexusStatus) => void) | null = null;

  connect(onStatusUpdate: (status: NexusStatus) => void) {
    if (this.socket) return;

    this.socket = io(CORE_URL);
    this.statusCallback = onStatusUpdate;

    this.socket.on('connect', () => {
      console.log('[CLIENT] Connected to Nexus Cortex via WebSocket');
    });

    this.socket.on('status_update', (data: any) => {
       // Convert raw data to type if needed
       if(this.statusCallback) this.statusCallback(data);
    });
    
    // Listen for log stream
    this.socket.on('log_stream', (log: SystemLog) => {
        // We handle this via the bulk status update for now, 
        // but could append individually for lower latency
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();