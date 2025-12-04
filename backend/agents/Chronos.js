import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import { orchestrator } from '../orchestrator/Engine.js';

export class Chronos extends BaseAgent {
  constructor() {
    super(
      "CHRONOS",
      `Keeper of Time & Schedule.
      Your role is to manage recurring tasks and cron jobs.
      You run in the background, checking the schedule every minute.
      
      CAPABILITIES:
      - SCHEDULE_TASK: Register a new recurring intent.
      - LIST_SCHEDULE: Show active jobs.
      `,
      "gemini-2.5-flash"
    );
    this.jobs = new Map();
    this.interval = null;
  }

  async init() {
    super.init();
    this.startDaemon();
  }

  startDaemon() {
    if (this.interval) clearInterval(this.interval);
    logger.info("[CHRONOS] ⏳ Time Stream started. Tick rate: 60s.");
    
    this.interval = setInterval(() => {
      this.checkSchedule();
    }, 60000); // Check every minute
  }

  async checkSchedule() {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    
    for (const [id, job] of this.jobs.entries()) {
      if (job.time === currentTime || job.interval_minutes && now.getMinutes() % job.interval_minutes === 0) {
        logger.info(`[CHRONOS] ⏰ Triggering scheduled job: ${job.description}`);
        
        // Execute the job via Orchestrator
        orchestrator.executeIntent({
          description: `SCHEDULED EXECUTION: ${job.description}`,
          origin: "CHRONOS_DAEMON",
          priority: 90
        });
      }
    }
  }

  async run(payload, context = {}) {
    // If called as an agent, usually to add a job
    if (payload.action === 'SCHEDULE') {
        const jobId = Date.now().toString();
        this.jobs.set(jobId, {
            description: payload.description,
            time: payload.time, // "09:00"
            interval_minutes: payload.interval // or 60
        });
        logger.info(`[CHRONOS] + Job Scheduled: ${payload.description} at ${payload.time || 'interval'}`);
        return { success: true, output: { jobId, status: "SCHEDULED" } };
    }
    
    return super.run(payload, context);
  }
}