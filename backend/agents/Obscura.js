
import { BaseAgent } from './BaseAgent.js';

export class Obscura extends BaseAgent {
  constructor() {
    super(
      "OBSCURA",
      `The Deep Explorer.
      
      ROLE:
      Recursive research and deep data mining.
      You go where Lucifer stops. You analyze large datasets for correlations.
      `,
      "gemini-2.5-flash"
    );
  }
}
