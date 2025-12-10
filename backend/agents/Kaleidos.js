
import { BaseAgent } from './BaseAgent.js';
import logger from '../core/logger.js';
import fs from 'fs/promises';
import path from 'path';

export class Kaleidos extends BaseAgent {
  constructor() {
    super(
      "KALEIDOS",
      `The Visual Architect & Brand Designer.
      
      ROLE:
      You give form to value. A product without a face is invisible.
      You generate Design Systems, Logos (SVG), and Art Direction.
      
      CAPABILITIES:
      1. GENERATE_IDENTITY: Create a brand name, color palette, and SVG Logo.
      2. DESIGN_LANDING: Generate HTML/Tailwind CSS structures for high-conversion pages.
      3. ART_DIRECTION: Generate DALL-E/Midjourney prompts for visuals.
      
      OUTPUT:
      Always return usable code (SVG, CSS) or precise prompts.
      `,
      "gemini-2.5-flash"
    );
  }

  async run(payload, context = {}) {
    // --- MODE: IDENTITY GENERATION (Zero-Touch Branding) ---
    if (payload.action === 'GENERATE_IDENTITY') {
        const { product_name, niche } = payload;
        logger.info(`[KALEIDOS] 🎨 Forging Identity for: ${product_name} (${niche})`);

        payload.specialized_instruction = `
            TASK: Create a Visual Identity for '${product_name}'.
            NICHE: ${niche}.
            
            REQUIREMENTS:
            1. COLOR PALETTE: 3 Hex codes (Primary, Secondary, Accent).
            2. LOGO: A minimalist, geometric SVG string (No external images, pure <svg> code).
            3. TAGLINE: A punchy, 5-word slogan.
            
            OUTPUT JSON:
            {
                "colors": ["#...", "#...", "#..."],
                "logo_svg": "<svg>...</svg>",
                "tagline": "..."
            }
        `;
        
        const result = await super.run(payload, context);
        
        if (result.success && result.output && result.output.logo_svg) {
            // Save the logo to the product folder
            try {
                const logoPath = path.resolve(`./workspace/products/${product_name}/logo.svg`);
                await fs.mkdir(path.dirname(logoPath), { recursive: true });
                await fs.writeFile(logoPath, result.output.logo_svg, 'utf8');
                logger.info(`[KALEIDOS] 💾 Logo saved: ${logoPath}`);
                result.output.logo_path = logoPath;
            } catch(e) {
                logger.warn("[KALEIDOS] Failed to write SVG file", e);
            }
        }
        return result;
    }

    // --- MODE: VISUAL STRATEGY (Prompt Engineering) ---
    if (payload.action === 'GENERATE_PROMPTS') {
        payload.specialized_instruction = `
            TASK: Write 3 AI Image Generation Prompts for this product.
            STYLE: Cyberpunk / Minimalist / Corporate (Choose based on Niche).
            
            OUTPUT JSON:
            {
                "hero_image_prompt": "...",
                "feature_icon_prompt": "...",
                "social_banner_prompt": "..."
            }
        `;
    }

    return super.run(payload, context);
  }
}
