
import { io, Socket } from 'socket.io-client';
import { NexusStatus, SystemLog } from '../types';

const CORE_URL = "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private statusCallback: ((status: NexusStatus) => void) | null = null;
  private interventionCallback: ((data: any) => void) | null = null;

  connect(onStatusUpdate: (status: NexusStatus) => void) {
    if (this.socket) return;

    this.socket = io(CORE_URL);
    this.statusCallback = onStatusUpdate;

    this.socket.on('connect', () => {
      console.log('[CLIENT] Connected to Nexus Cortex via WebSocket');
    });

    this.socket.on('status_update', (data: any) => {
       if(this.statusCallback) this.statusCallback(data);
    });
    
    // Listen for Symbiote Intervention Requests
    this.socket.on('intervention_required', (data: any) => {
        if (this.interventionCallback) this.interventionCallback(data);
    });
  }

  onIntervention(callback: (data: any) => void) {
      this.interventionCallback = callback;
  }

  // ALLOW DIRECT ACCESS FOR CUSTOM EVENTS (Anima Pulse)
  getSocket() {
      return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
