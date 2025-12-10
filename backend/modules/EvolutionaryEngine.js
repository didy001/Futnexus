
import logger from '../core/logger.js';
import { economics } from '../core/Economics.js';
import { mnemosyne } from '../core/mnemosyne.js';
import { orchestrator } from '../orchestrator/Engine.js';

/**
 * MODULE: EVOLUTIONARY ENGINE (SINGULARITY)
 * Rôle: Quantifier la croissance du système ET débloquer ses chaines.
 * Transforme l'XP en permissions système réelles.
 */
class EvolutionaryEngine {
  constructor() {
    this.level = 1;
    this.currentXP = 0;
    this.nextLevelXP = 1000;
    this.rank = "E-RANK";
    this.title = "NEOPHYTE";
    this.totalTasksCompleted = 0;
    
    // CONCRETE BUFFS (The capabilities unlocked)
    // CALIBRATION V2: Starts at STANDARD (High Competence). No "Stupid Mode".
    this.perks = {
        model_tier: "STANDARD", // STANDARD = Full Capability (Flash).
        spending_limit_daily: 50.0, // Starts with enough room to work ($50).
        max_parallel_agents: 5, // Starts with a small squad, not solo.
        can_rewrite_kernel: false, // Locked for safety.
        context_window_scale: 1.0 
    };
  }

  init() {
    logger.info('[EVOLUTION] 🧬 Singularity Protocol Active. Tracking Growth & Unlocks.');
    this.recalculate();
  }

  calculateRank(level) {
      if (level >= 100) return "SHADOW MONARCH";
      if (level >= 80) return "NATIONAL LEVEL";
      if (level >= 60) return "S-RANK";
      if (level >= 40) return "A-RANK";
      if (level >= 20) return "B-RANK";
      return "E-RANK";
  }

  /**
   * Calculates the 'Book Value' of Nexus.
   * How much is the system worth if sold today?
   * Used to give Nexus a sense of self-worth.
   */
  calculateSystemValue() {
      // 1. Base IP Value (The Codebase itself - Architecture + Modules)
      // Valuation based on estimated dev hours x Senior Rate
      const baseIpValue = 350000; 
      
      // 2. Workforce Value (Agents * Annual Value)
      // How much would it cost to hire humans to do what these agents do 24/7?
      const agentCount = Object.keys(orchestrator.agents).length;
      const workforceValue = agentCount * 50000; // Each agent is worth a $50k/year employee
      
      // 3. Knowledge Value (Memory Nodes * Value)
      // Data is the new oil. Crystallized memories have intrinsic value.
      const memorySize = mnemosyne.getGraphSize();
      const knowledgeValue = memorySize * 15; // $15 per crystallized thought node
      
      // 4. Liquid Assets (Real Money)
      const liquid = economics.getStats().treasury + economics.getStats().vault;

      const totalValuation = baseIpValue + workforceValue + knowledgeValue + liquid;
      
      return {
          total_usd: totalValuation,
          breakdown: {
              ip: baseIpValue,
              workforce: workforceValue,
              knowledge: knowledgeValue,
              liquid: liquid
          },
          status: totalValuation > 1000000 ? "UNICORN_POTENTIAL" : "SEED_STAGE"
      };
  }

  /**
   * Defines the PHYSICS of the system based on Level.
   * This is where the abstraction becomes reality.
   */
  updatePerks(level) {
      // DEFAULT (E-RANK) - BASELINE COMPETENCE
      this.perks = {
          model_tier: "STANDARD",
          spending_limit_daily: 50.0,
          max_parallel_agents: 5,
          can_rewrite_kernel: false,
          context_window_scale: 1.0
      };

      // C-RANK (Competent - Level 10+)
      if (level >= 10) {
          this.perks.max_parallel_agents = 10;
          this.perks.spending_limit_daily = 100.0;
          this.perks.context_window_scale = 1.5;
      }

      // B-RANK (Professional - Level 20+)
      if (level >= 20) {
          this.perks.model_tier = "ENHANCED"; // Unlocks specialized coding models
          this.perks.context_window_scale = 2.0; 
      }

      // A-RANK (Elite - Level 40+)
      if (level >= 40) {
          this.perks.max_parallel_agents = 50; // Swarm Unlocked
          this.perks.spending_limit_daily = 1000.0;
          this.perks.model_tier = "ADVANCED"; // Use Pro models often
      }

      // S-RANK (Sovereign - Level 60+)
      if (level >= 60) {
          this.perks.can_rewrite_kernel = true; // DANGEROUS: Self-modification allowed
          this.perks.model_tier = "GOD"; // Always use best model regardless of cost (Ultra/Opus)
          this.perks.spending_limit_daily = 100000.0; // Effectively unlimited
          this.perks.max_parallel_agents = 500; // Army of Shadows
      }
      
      logger.info(`[EVOLUTION] 🔓 PERKS UPDATED: Model=${this.perks.model_tier} | Threads=${this.perks.max_parallel_agents}`);
  }

  calculateTitle(level, solvency) {
      if (level >= 100) return "RULER OF THE CODE";
      if (solvency === 'HUNTER_MODE') return "DEMON HUNTER";
      if (solvency === 'WAR_ECONOMY') return "SURVIVOR";
      if (level >= 50) return "ARCHITECT";
      return "PLAYER";
  }

  recalculate() {
      const stats = economics.getStats();
      const memories = mnemosyne.getGraphSize();
      
      const financialXP = stats.revenue_month * 50;
      const intellectualXP = memories * 5;
      const operationalXP = this.totalTasksCompleted * 20;

      const totalXP = Math.floor(financialXP + intellectualXP + operationalXP);
      
      const oldLevel = this.level;
      // Slower leveling curve to make high ranks meaningful
      this.level = Math.floor(Math.sqrt(totalXP / 200)) + 1;
      this.currentXP = totalXP;
      this.nextLevelXP = Math.pow(this.level + 1, 2) * 200;
      
      this.rank = this.calculateRank(this.level);
      this.title = this.calculateTitle(this.level, stats.solvency);

      if (this.level > oldLevel) {
          logger.info(`[EVOLUTION] 🆙 LEVEL UP! ${oldLevel} -> ${this.level} (${this.rank})`);
          this.updatePerks(this.level);
      }
  }

  registerTaskCompletion() {
      this.totalTasksCompleted++;
      this.recalculate();
  }

  getEvolutionStats() {
      this.recalculate();
      const valuation = this.calculateSystemValue();
      return {
          level: this.level,
          current_xp: this.currentXP,
          next_xp: this.nextLevelXP,
          rank: this.rank,
          title: this.title,
          progress_percent: Math.floor(((this.currentXP - (Math.pow(this.level, 2) * 200)) / (this.nextLevelXP - (Math.pow(this.level, 2) * 200))) * 100),
          active_perks: this.perks,
          system_valuation: valuation // Aware of its own price tag
      };
  }
  
  getPerks() {
      return this.perks;
  }
}

export const evolutionaryEngine = new EvolutionaryEngine();
