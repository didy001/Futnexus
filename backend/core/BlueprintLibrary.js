
import logger from './logger.js';
import { skillForge } from './SkillForge.js';
import { cerebro } from './cerebro.js';

class BlueprintLibrary {
  constructor() {
    this.library = new Map();
  }

  async init() {
    logger.info('[BLUEPRINT LIBRARY] 📚 Loading Nexus Arsenal (OMEGA WARHEADS)...');
    this._loadHardcodedTemplates();
    logger.info(`[BLUEPRINT LIBRARY] ✅ Loaded ${this.library.size} operational protocols.`);
  }

  getBlueprint(id) {
    return this.library.get(id);
  }

  /**
   * OMEGA CAPABILITY: DYNAMIC ARSENAL
   * If a blueprint doesn't exist, we don't fail. We forge it immediately.
   */
  async findOrForgeBlueprint(intentDescription) {
    // 1. Try to find exact or close match
    const existing = this.findMatchingBlueprint(intentDescription);
    if (existing) return existing;

    // 2. FORGE IT (Just-in-Time Engineering)
    logger.info(`[BLUEPRINT LIBRARY] ⚠️ Protocol '${intentDescription}' not found. FORGING NEW WEAPON.`);
    
    const prompt = `
        TASK: Create a JSON Workflow Blueprint (n8n style) for: "${intentDescription}".
        
        AVAILABLE NODE TYPES:
        - START
        - HTTP_REQUEST (url, method, body)
        - AGENT_PROMPT (agent, prompt)
        - CODE_EXEC (javascript sandbox)
        - DELAY (ms)
        - DECISION (condition string using 'result' variable)
        - TRIGGER_BLUEPRINT (blueprintId)
        
        OUTPUT JSON ONLY:
        {
            "id": "AUTO_GEN_${Date.now()}",
            "name": "Auto-Protocol: ${intentDescription}",
            "description": "Forged by Belsebuth",
            "workflow": { "nodes": [], "edges": [] }
        }
    `;

    try {
        const raw = await cerebro.think("gemini-2.5-flash", prompt, "You are a Workflow Architect.");
        const blueprint = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
        
        this.library.set(blueprint.id, blueprint);
        logger.info(`[BLUEPRINT LIBRARY] ⚔️ Weapon Forged: ${blueprint.id}`);
        return blueprint;
    } catch (e) {
        logger.error("Forge Failed", e);
        return null;
    }
  }

  findMatchingBlueprint(intentDescription) {
    const keywords = intentDescription.toLowerCase().split(' ');
    let bestMatch = null;
    let maxScore = 0;

    for (const [id, bp] of this.library.entries()) {
        let score = 0;
        if (bp.description.toLowerCase().includes(intentDescription.toLowerCase())) score += 10;
        keywords.forEach(k => {
            if (bp.keywords.some(bk => bk.includes(k))) score += 2;
            if (bp.name.toLowerCase().includes(k)) score += 3;
        });

        if (score > maxScore && score > 3) {
            maxScore = score;
            bestMatch = bp;
        }
    }
    return bestMatch;
  }

  _loadHardcodedTemplates() {
      const templates = [
          // --- CATEGORY 1: CAPITAL INJECTION (Cashflow) ---
          {
              id: "IGNITION_ZERO_ARBITRAGE",
              name: "Protocol: ZERO (Digital Labor)",
              keywords: ["convert", "process", "image", "audio", "manual", "free"],
              description: "Uses local CPU to perform digital labor tasks (Conversion, Resize, Transcribe) to sell as micro-services.",
              category: "CAPITAL",
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "scan_fiverr", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "Find top 3 'file conversion' gigs on Fiverr with high volume. Return requirements." } },
                      { id: "build_script", type: "AGENT_PROMPT", parameters: { agent: "BELSEBUTH", prompt: "Write a Node.js script to automate {{scan_fiverr.output}}. Use 'sharp' or 'ffmpeg'." } },
                      { id: "package_service", type: "AGENT_PROMPT", parameters: { agent: "KALEIDOS", prompt: "Create a landing page copy for this automation service." } }
                  ],
                  edges: [{source: "start", target: "scan_fiverr"}, {source: "scan_fiverr", target: "build_script"}, {source: "build_script", target: "package_service"}]
              }
          },
          {
              id: "TREND_HUNTER",
              name: "Autonomous Trend Hunter V2",
              keywords: ["trend", "money", "profit", "hunt", "niche", "saas"],
              description: "Scans Reddit/X for pain points -> Builds Solution -> Brands it -> Deploys.",
              category: "CAPITAL",
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "scan", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "Scan r/SaaS and r/Python. Identify 3 technical pain points." } },
                      { id: "select", type: "AGENT_PROMPT", parameters: { agent: "MERCATOR", prompt: "Select the highest ROI idea from: {{scan.output}}." } },
                      { id: "build", type: "AGENT_PROMPT", parameters: { agent: "BELSEBUTH", prompt: "Build MVP for: {{select.output}}. Return files." } },
                      { id: "brand", type: "AGENT_PROMPT", parameters: { agent: "KALEIDOS", prompt: "Generate Brand Identity (Logo SVG + Colors) for {{select.output}}." } },
                      { id: "deploy", type: "AGENT_PROMPT", parameters: { agent: "OMEGA_NODE", prompt: "Deploy to public folder." } }
                  ],
                  edges: [
                      {source: "start", target: "scan"}, {source: "scan", target: "select"}, 
                      {source: "select", target: "build"}, {source: "build", target: "brand"}, 
                      {source: "brand", target: "deploy"}
                  ]
              }
          },

          // --- CATEGORY 2: INFLUENCE & MARKETING (Growth) ---
          {
              id: "REDDIT_INFILTRATOR",
              name: "Reddit Hive-Mind Integration",
              keywords: ["reddit", "social", "karma", "marketing", "post"],
              description: "Scans specific Subreddits for questions, drafts high-value answers, and subtly plugs the product.",
              category: "INFLUENCE",
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "scan_reddit", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "Find 3 recent questions in r/SaaS regarding {{start.topic}}." } },
                      { id: "analyze_sentiment", type: "AGENT_PROMPT", parameters: { agent: "HYPNOS", prompt: "Analyze the tone of these threads: {{scan_reddit.output}}." } },
                      { id: "draft_comments", type: "AGENT_PROMPT", parameters: { agent: "HYPNOS", action: "GENERATE_SOCIAL_CONTENT", prompt: "Draft helpful comments for Reddit. Tone: {{analyze_sentiment.output}}. Topic: {{start.topic}}" } },
                      { id: "review", type: "DECISION", parameters: { condition: "true" } } // Placeholder for Human Review
                  ],
                  edges: [
                      {source: "start", target: "scan_reddit"}, {source: "scan_reddit", target: "analyze_sentiment"}, 
                      {source: "analyze_sentiment", target: "draft_comments"}, {source: "draft_comments", target: "review"}
                  ]
              }
          },
          {
              id: "TWITTER_THOUGHT_LEADER",
              name: "X/Twitter Authority Engine",
              keywords: ["twitter", "x", "social", "viral", "thread"],
              description: "Generates high-engagement threads based on trending tech news.",
              category: "INFLUENCE",
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "scan_news", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "What is the #1 trending AI news today?" } },
                      { id: "draft_thread", type: "AGENT_PROMPT", parameters: { agent: "HYPNOS", action: "GENERATE_SOCIAL_CONTENT", inputs: { platform: "TWITTER" }, prompt: "Write a viral thread about: {{scan_news.output}}" } },
                      { id: "create_visual", type: "AGENT_PROMPT", parameters: { agent: "KALEIDOS", action: "GENERATE_PROMPTS", prompt: "Create a DALL-E prompt for this thread." } }
                  ],
                  edges: [{source: "start", target: "scan_news"}, {source: "scan_news", target: "draft_thread"}, {source: "draft_thread", target: "create_visual"}]
              }
          },
          {
              id: "LINKEDIN_PROFESSIONAL",
              name: "LinkedIn B2B Closer",
              keywords: ["linkedin", "b2b", "sales", "professional"],
              description: "Drafts professional articles aimed at CTOs/Founders.",
              category: "INFLUENCE",
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "find_pain", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "What is the biggest challenge for CTOs in {{start.year}}?" } },
                      { id: "draft_post", type: "AGENT_PROMPT", parameters: { agent: "HYPNOS", action: "GENERATE_SOCIAL_CONTENT", inputs: { platform: "LINKEDIN" }, prompt: "Write a LinkedIn post solving: {{find_pain.output}}" } }
                  ],
                  edges: [{source: "start", target: "find_pain"}, {source: "find_pain", target: "draft_post"}]
              }
          },

          // --- CATEGORY 3: INFRASTRUCTURE & DEVOPS ---
          {
              id: "SELF_HEALING_AUDIT",
              name: "Phoenix Regeneration",
              keywords: ["fix", "repair", "bug", "heal", "code"],
              description: "Scans codebase for errors, writes tests, patches bugs automatically.",
              category: "INFRA",
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "read_files", type: "CODE_EXEC", parameters: { code: "const fs = require('fs'); return fs.readdirSync('./backend').join(',');" } },
                      { id: "find_bugs", type: "AGENT_PROMPT", parameters: { agent: "PHOENIX", prompt: "Scan these files for potential memory leaks or logic errors: {{read_files.output}}. Return PATCH instructions." } },
                      { id: "apply_patch", type: "AGENT_PROMPT", parameters: { agent: "PHOENIX", action: "TEST_AND_MERGE", prompt: "Apply the generated patch." } }
                  ],
                  edges: [{source: "start", target: "read_files"}, {source: "read_files", target: "find_bugs"}, {source: "find_bugs", target: "apply_patch"}]
              }
          }
      ];

      templates.forEach(t => this.library.set(t.id, t));
  }
}

export const blueprintLibrary = new BlueprintLibrary();
