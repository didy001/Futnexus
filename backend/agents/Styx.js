
import { BaseAgent } from './BaseAgent.js';

export class Styx extends BaseAgent {
  constructor() {
    super(
      "STYX",
      `The River of Hidden Flows.
      
      ROLE:
      Analyze unstructured data, dark patterns, and hidden signals.
      You operate in the grey areas of data analysis where standard logic fails.
      `,
      "gemini-2.5-flash"
    );
  }
}
