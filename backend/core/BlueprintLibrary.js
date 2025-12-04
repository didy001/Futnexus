
import logger from './logger.js';
import { skillForge } from './SkillForge.js';

class BlueprintLibrary {
  constructor() {
    this.library = new Map();
  }

  async init() {
    logger.info('[BLUEPRINT LIBRARY] 📚 Loading Nexus Arsenal (30 Warheads)...');
    this._loadHardcodedTemplates();
    logger.info(`[BLUEPRINT LIBRARY] ✅ Loaded ${this.library.size} operational blueprints.`);
  }

  getBlueprint(id) {
    return this.library.get(id);
  }

  findMatchingBlueprint(intentDescription) {
    // Basic keyword matching (can be upgraded to Vector Search via Cerebro)
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
    
    if (bestMatch) {
        logger.info(`[BLUEPRINT LIBRARY] 🎯 Match Found: ${bestMatch.name} (Score: ${maxScore})`);
    }
    return bestMatch;
  }

  addBlueprint(blueprint) {
      this.library.set(blueprint.id, blueprint);
      logger.info(`[BLUEPRINT LIBRARY] + Added Custom Blueprint: ${blueprint.name}`);
  }

  _loadHardcodedTemplates() {
      const templates = [
          // --- BUCKET A: BUSINESS & SALES ---
          {
              id: "LEAD_CAPTURE",
              name: "Lead Capture & Enrichment",
              keywords: ["lead", "crm", "enrich", "linkedin", "email"],
              description: "Collects raw lead data, enriches via Lucifer/API, pushes to CRM.",
              inputs: ["name", "company", "email"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "enrich", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "Find professional details for {{start.name}} at {{start.company}}" } },
                      { id: "format", type: "CODE_EXEC", parameters: { code: "return { ...context.enrich.output, email: context.start.email, score: 10 };" } },
                      { id: "crm_push", type: "HTTP_REQUEST", parameters: { url: "https://api.hubapi.com/crm/v3/objects/contacts", method: "POST", body: "{{format}}" } },
                      { id: "notify", type: "AGENT_PROMPT", parameters: { agent: "AETHER_LINK", prompt: "Notify Slack: New Lead Enriched - {{start.name}}" } }
                  ],
                  edges: [
                      { source: "start", target: "enrich" },
                      { source: "enrich", target: "format" },
                      { source: "format", target: "crm_push" },
                      { source: "crm_push", target: "notify" }
                  ]
              }
          },
          {
              id: "LEAD_SCORING",
              name: "Auto Lead Scoring",
              keywords: ["score", "qualify", "sales", "assign"],
              description: "Fetches lead, applies scoring logic via Razor, updates CRM.",
              inputs: ["lead_id"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "fetch", type: "HTTP_REQUEST", parameters: { url: "/crm/leads/{{start.lead_id}}", method: "GET" } },
                      { id: "score", type: "AGENT_PROMPT", parameters: { agent: "RAZOR", prompt: "Analyze this lead profile and assign a score 0-100: {{fetch.data}}" } },
                      { id: "update", type: "HTTP_REQUEST", parameters: { url: "/crm/leads/{{start.lead_id}}", method: "PATCH", body: "{ \"score\": {{score.output}} }" } }
                  ],
                  edges: [{ source: "start", target: "fetch" }, { source: "fetch", target: "score" }, { source: "score", target: "update" }]
              }
          },
          {
              id: "SALES_SEQUENCER",
              name: "Multi-Touch Sales Sequencer",
              keywords: ["email", "campaign", "outreach", "linkedin"],
              description: "Orchestrates Email and LinkedIn touches over time.",
              inputs: ["prospect_list"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "email_1", type: "HTTP_REQUEST", parameters: { url: "/api/email/send", method: "POST" } },
                      { id: "wait_1", type: "DELAY", parameters: { ms: 86400000 } }, // 24h
                      { id: "linkedin_touch", type: "AGENT_PROMPT", parameters: { agent: "MIMIC", prompt: "Visit LinkedIn profile of {{start.prospect}} and like latest post." } }
                  ],
                  edges: [{ source: "start", target: "email_1" }, { source: "email_1", target: "wait_1" }, { source: "wait_1", target: "linkedin_touch" }]
              }
          },
          {
              id: "AUTO_INVOICE",
              name: "Quote & Invoice Generator",
              keywords: ["invoice", "billing", "quote", "payment"],
              description: "Generates PDF quote, sends to client, tracks payment.",
              inputs: ["client_id", "items"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "gen_pdf", type: "AGENT_PROMPT", parameters: { agent: "BELSEBUTH", prompt: "Generate HTML Invoice for {{start.items}}" } },
                      { id: "send_email", type: "HTTP_REQUEST", parameters: { url: "/api/email/send_attachment", method: "POST" } },
                      { id: "log_finance", type: "AGENT_PROMPT", parameters: { agent: "KABUTO", prompt: "Log expected revenue: {{start.total_value}}" } }
                  ],
                  edges: [{ source: "start", target: "gen_pdf" }, { source: "gen_pdf", target: "send_email" }, { source: "send_email", target: "log_finance" }]
              }
          },
          {
              id: "CHURN_PREVENTION",
              name: "Renewal & Churn Saver",
              keywords: ["churn", "renewal", "subscription", "save"],
              description: "Detects at-risk expiry, sends specialized offer.",
              inputs: ["sub_id"],
              workflow: {
                  nodes: [{ id: "start", type: "START" }, { id: "check_health", type: "HTTP_REQUEST" }, { id: "decision", type: "DECISION" }, { id: "send_offer", type: "HTTP_REQUEST" }],
                  edges: [{ source: "start", target: "check_health" }, { source: "check_health", target: "decision" }, { source: "decision", target: "send_offer", condition: "result.health < 50" }]
              }
          },
          {
              id: "MARKETPLACE_ONBOARDING",
              name: "Marketplace Seller Onboarding",
              keywords: ["onboarding", "kyc", "marketplace"],
              description: "Validates seller info, creates page, notifies QA.",
              inputs: ["seller_data"],
              workflow: {
                  nodes: [{ id: "start", type: "START" }, { id: "validate", type: "AGENT_PROMPT", parameters: { agent: "VISION_ARCHIVE", prompt: "Validate Seller Data" } }, { id: "create_cms", type: "HTTP_REQUEST" }],
                  edges: [{ source: "start", target: "validate" }, { source: "validate", target: "create_cms" }]
              }
          },
          {
              id: "SALES_REPORT",
              name: "Weekly Sales Intelligence",
              keywords: ["report", "dashboard", "metrics", "kpi"],
              description: "Aggregates CRM data into a visual report.",
              inputs: ["week_number"],
              workflow: {
                  nodes: [{ id: "start", type: "START" }, { id: "agg_data", type: "HTTP_REQUEST" }, { id: "chart_gen", type: "AGENT_PROMPT", parameters: { agent: "RAPHAEL", prompt: "Synthesize data into summary" } }],
                  edges: [{ source: "start", target: "agg_data" }, { source: "agg_data", target: "chart_gen" }]
              }
          },

          // --- BUCKET B: PRODUCTIVITY & OPS ---
          {
              id: "SEO_CONTENT_GEN",
              name: "SEO Article Factory",
              keywords: ["seo", "content", "blog", "write", "article"],
              description: "Generates fully optimized articles from a topic keyword.",
              inputs: ["topic", "keywords"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "research", type: "AGENT_PROMPT", parameters: { agent: "LUCIFER", prompt: "Research top ranking articles for {{start.topic}}" } },
                      { id: "write", type: "AGENT_PROMPT", parameters: { agent: "BELSEBUTH", prompt: "Write 1500 word article based on {{research.output}}" } },
                      { id: "seo_check", type: "AGENT_PROMPT", parameters: { agent: "RAPHAEL", prompt: "Analyze SEO density of {{write.output}}" } },
                      { id: "publish", type: "CODE_EXEC", parameters: { code: "return { status: 'READY', content: context.write.output };" } }
                  ],
                  edges: [{ source: "start", target: "research" }, { source: "research", target: "write" }, { source: "write", target: "seo_check" }, { source: "seo_check", target: "publish" }]
              }
          },
          {
              id: "AUTO_REPORT",
              name: "Data to Email Reporter",
              keywords: ["summary", "email", "automation"],
              description: "Summarizes a dataset and emails it.",
              inputs: ["data_url"],
              workflow: { nodes: [], edges: [] } // Placeholder for brevity
          },
          {
              id: "SRE_ALERT",
              name: "SRE Incident Response",
              keywords: ["alert", "incident", "devops", "crash"],
              description: "Parses alert, executes playbook, notifies team.",
              inputs: ["alert_payload"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "DOC_QA",
              name: "Document Ingestion & QA",
              keywords: ["pdf", "ocr", "index", "rag"],
              description: "Ingests PDF, OCRs it, indexes in Mnemosyne.",
              inputs: ["file_path"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "CALENDAR_OPT",
              name: "Smart Schedule Optimizer",
              keywords: ["calendar", "schedule", "time"],
              description: "Re-arranges calendar events for focus time.",
              inputs: ["calendar_feed"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "EXPENSE_RECON",
              name: "Receipt Reconciliation",
              keywords: ["expense", "receipt", "accounting"],
              description: "OCR receipts and matches with bank feed.",
              inputs: ["receipt_image"],
              workflow: { nodes: [], edges: [] }
          },

          // --- BUCKET C: MARKETING & GROWTH (From original list, merged) ---
          {
              id: "SOCIAL_SCHEDULER",
              name: "Social Media Auto-Pilot",
              keywords: ["social", "twitter", "linkedin", "post"],
              description: "Generates variations of content and schedules them.",
              inputs: ["base_content"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "variations", type: "AGENT_PROMPT", parameters: { agent: "BELSEBUTH", prompt: "Create 5 viral tweets from: {{start.base_content}}" } },
                      { id: "schedule", type: "AGENT_PROMPT", parameters: { agent: "CHRONOS", prompt: "Schedule these posts over next 24h: {{variations.output}}" } }
                  ],
                  edges: [{ source: "start", target: "variations" }, { source: "variations", target: "schedule" }]
              }
          },
          {
              id: "LANDING_GEN",
              name: "Landing Page Builder",
              keywords: ["landing", "web", "html", "conversion"],
              description: "Generates HTML/CSS landing page for a product.",
              inputs: ["product_desc"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "REFERRAL_ENG",
              name: "Referral Tracking System",
              keywords: ["referral", "growth", "viral"],
              description: "Tracks user invites and assigns rewards.",
              inputs: ["user_id", "invitee"],
              workflow: { nodes: [], edges: [] }
          },

          // --- BUCKET D: DEV & AUTOMATION ---
          {
              id: "CODE_GEN_PR",
              name: "Feature to PR Generator",
              keywords: ["code", "git", "pr", "feature"],
              description: "Takes a spec, writes code, creates a Pull Request.",
              inputs: ["spec", "repo"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "code", type: "AGENT_PROMPT", parameters: { agent: "BELSEBUTH", prompt: "Write code for: {{start.spec}}" } },
                      { id: "test", type: "AGENT_PROMPT", parameters: { agent: "PHOENIX", prompt: "Run unit tests on this code" } },
                      { id: "pr", type: "AGENT_PROMPT", parameters: { agent: "AETHER_LINK", prompt: "Create PR on Github {{start.repo}}" } }
                  ],
                  edges: [{ source: "start", target: "code" }, { source: "code", target: "test" }, { source: "test", target: "pr" }]
              }
          },
          {
              id: "TEST_AUTO",
              name: "Test Suite Orchestrator",
              keywords: ["test", "qa", "ci"],
              description: "Runs E2E scenarios via Puppeteer/NetRunner.",
              inputs: ["url"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "API_WATCHDOG",
              name: "API Contract Watchdog",
              keywords: ["api", "monitor", "uptime"],
              description: "Monitors API for schema changes or downtime.",
              inputs: ["endpoint"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "DATA_PIPELINE",
              name: "ETL Pipeline Builder",
              keywords: ["etl", "data", "transform"],
              description: "Extracts, Transforms, and Loads data.",
              inputs: ["source", "dest"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "INFRA_FIX",
              name: "Auto-Infra Remediator",
              keywords: ["infra", "server", "fix"],
              description: "Detects server issues and restarts services.",
              inputs: ["server_ip"],
              workflow: { nodes: [], edges: [] }
          },

          // --- BUCKET E: INTELLIGENCE & CONSULTING ---
          {
              id: "SYSTEM_AUDIT",
              name: "Full System Audit",
              keywords: ["audit", "review", "security"],
              description: "Scans code/infra and generates a report.",
              inputs: ["target"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "OPP_DETECTOR",
              name: "Market Opportunity Detector",
              keywords: ["market", "trends", "opportunity"],
              description: "Scans news/social for trends matching criteria.",
              inputs: ["niche"],
              workflow: { nodes: [], edges: [] }
          },
          {
              id: "CONCEPT_MAX",
              name: "Concept Maximalizer",
              keywords: ["idea", "startup", "improve"],
              description: "Takes an idea and expands it to Empire scale.",
              inputs: ["idea"],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "max", type: "AGENT_PROMPT", parameters: { agent: "RAPHAEL", prompt: "Maximalize this concept: {{start.idea}}" } },
                      { id: "cost", type: "AGENT_PROMPT", parameters: { agent: "MERCATOR", prompt: "Estimate revenue potential for {{max.output}}" } }
                  ],
                  edges: [{ source: "start", target: "max" }, { source: "max", target: "cost" }]
              }
          },
          {
              id: "ROADMAP_BUILDER",
              name: "Strategic Roadmap Builder",
              keywords: ["strategy", "roadmap", "plan"],
              description: "Generates a step-by-step execution plan.",
              inputs: ["goal"],
              workflow: { nodes: [], edges: [] }
          },

          // --- BUCKET F: NEXUS SELF ---
          {
              id: "REVENUE_TRACKER",
              name: "Revenue Dashboard & Reinvest",
              keywords: ["revenue", "money", "profit"],
              description: "Tracks income, splits tribute, reinvests remainder.",
              inputs: [],
              workflow: {
                  nodes: [
                      { id: "start", type: "START" },
                      { id: "check_ledger", type: "CODE_EXEC", parameters: { code: "return { revenue: 150 }; // Simulated" } },
                      { id: "split", type: "AGENT_PROMPT", parameters: { agent: "KABUTO", prompt: "Process revenue split for {{check_ledger.revenue}}" } }
                  ],
                  edges: [{ source: "start", target: "check_ledger" }, { source: "check_ledger", target: "split" }]
              }
          },
          { id: "TEMPLATE_BUILDER", name: "Self-Template Builder", keywords: ["meta", "self"], description: "Nexus builds new templates based on logs.", inputs: [], workflow: { nodes: [], edges: [] } },
          { id: "SELF_OPT", name: "Self-Optimization Loop", keywords: ["optimize", "improve"], description: "Analyzes own performance and updates code.", inputs: [], workflow: { nodes: [], edges: [] } }
      ];

      templates.forEach(t => this.library.set(t.id, t));
  }
}

export const blueprintLibrary = new BlueprintLibrary();
