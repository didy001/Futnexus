
import logger from '../core/logger.js';
import { llmClient } from '../core/LlmClient.js';

/**
 * MODULE 4: MONÉTISATION INTELLIGENTE (ROI ENGINE)
 * Rôle: CFO Produit & Gardien de la Marge.
 */
class RoiEngine {
  constructor() {
      // Estimated costs per operation type (USD) - CLOUD BASELINE
      this.CLOUD_COSTS = {
          'LLM_CALL_SIMPLE': 0.005,
          'LLM_CALL_COMPLEX': 0.03,
          'IMAGE_GEN': 0.04,
          'DEPLOYMENT': 0.10,
          'TRANSACTION_FEE': 0.05
      };
      
      this.MIN_MARGIN_PERCENT = 80; // We demand 80% margin.
  }

  init() {
    logger.info('[ROI ENGINE] 💰 Value Architect Online. Margin Threshold: 80%.');
  }

  /**
   * Calculates if a blueprint is worth executing based on estimated cost vs potential value.
   */
  async analyzeProfitability(blueprintId, estimatedRevenue) {
      // 1. Estimate Cost based on BRAIN TYPE
      const cost = this._estimateBlueprintCost(blueprintId);
      
      // 2. Calculate Projected Margin
      // If Revenue is 0 (internal tool), check if cost is 0 (local). If so, approve.
      if (estimatedRevenue === 0 && cost < 0.01) {
          return {
              blueprint: blueprintId,
              estimated_cost: cost,
              estimated_revenue: 0,
              projected_margin: "INFINITE (Internal Tool)",
              approved: true,
              reason: "LOCAL_RESOURCE_FREE"
          };
      }

      const margin = estimatedRevenue - cost;
      const marginPercent = estimatedRevenue > 0 ? (margin / estimatedRevenue) * 100 : 0;

      const analysis = {
          blueprint: blueprintId,
          estimated_cost: cost,
          estimated_revenue: estimatedRevenue,
          projected_margin: marginPercent.toFixed(1) + '%',
          approved: false,
          reason: ""
      };

      // OMEGA EXCEPTION: If running locally, we tolerate ANY profit > 0 because cash burn is zero
      // The MIN_MARGIN_PERCENT only applies if we are burning hard cash (Cloud).
      const isLocal = llmClient.useLocal || llmClient.circuitOpen;

      if (isLocal && margin > 0) {
           analysis.approved = true;
           analysis.reason = "LOCAL_MODEL_OVERRIDE (Zero Burn / Pure Profit)";
      } else if (marginPercent >= this.MIN_MARGIN_PERCENT) {
          analysis.approved = true;
          analysis.reason = "HIGH_YIELD_APPROVED";
      } else {
           analysis.approved = false;
           analysis.reason = `LOW_YIELD_REJECTED (Requires >${this.MIN_MARGIN_PERCENT}% margin on Cloud)`;
           logger.warn(`[ROI ENGINE] 🛑 BLOCKED ${blueprintId}. Cost: $${cost}, Rev: $${estimatedRevenue}. Margin too low for Cloud Ops.`);
      }

      return analysis;
  }

  _estimateBlueprintCost(blueprintId) {
      // Rough heuristic based on ID keywords
      let steps = 5;
      if (blueprintId.includes("COMPLEX") || blueprintId.includes("FULL")) steps = 20;
      if (blueprintId.includes("MICRO")) steps = 3;

      // DYNAMIC COST ADJUSTMENT
      // If using Local LLM, LLM costs are effectively ZERO (electricity excluded)
      const baseCost = (llmClient.useLocal || llmClient.circuitOpen) ? 0.0001 : this.CLOUD_COSTS.LLM_CALL_COMPLEX;

      return steps * baseCost;
  }

  computeAssetValue(assetName, assetType, complexityScore) {
    let basePrice = 0;
    let packaging = "RAW";

    if (assetType === 'PYTHON_SCRIPT') basePrice = 19.00;
    if (assetType === 'SAAS_BOILERPLATE') basePrice = 49.00;
    if (assetType === 'DATASET') basePrice = 9.00;

    const multiplier = 1 + (complexityScore * 0.1);
    let finalPrice = Math.floor(basePrice * multiplier) + 0.99;

    if (finalPrice > 30) packaging = "PREMIUM_BUNDLE";
    else packaging = "LITE_TOOL";

    return {
        product_name: assetName,
        suggested_price: finalPrice,
        packaging_model: packaging
    };
  }
}

export const roiEngine = new RoiEngine();
