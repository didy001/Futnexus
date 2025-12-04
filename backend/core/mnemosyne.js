
import { createClient } from '@supabase/supabase-js';
import { cerebro } from './cerebro.js';
import logger from './logger.js';
import Graph from 'graphology';
import fs from 'fs/promises';
import path from 'path';

class Mnemosyne {
  constructor() {
    this.graph = new Graph();
    this.graphPath = path.resolve('./workspace/memory_graph.json');
    this.vectorPath = path.resolve('./workspace/memory_vectors.json');
    this.vectorStore = [];
  }

  async initGraph() {
    try {
        await fs.mkdir(path.dirname(this.graphPath), { recursive: true });
        try {
            const data = await fs.readFile(this.graphPath, 'utf8');
            this.graph.import(JSON.parse(data));
        } catch (e) { /* ignore */ }

        try {
            const vData = await fs.readFile(this.vectorPath, 'utf8');
            this.vectorStore = JSON.parse(vData);
        } catch (e) { /* ignore */ }

        logger.info(`[MNEMOSYNE] 🧠 Memory Loaded. Nodes: ${this.graph.order}.`);
        this.pruneDuplicates();
    } catch (e) {
        logger.error(`[MNEMOSYNE] Init Failed`, e);
    }
  }

  // OMEGA: Self-Cleaning Memory
  pruneDuplicates() {
      const initialOrder = this.graph.order;
      const seenContent = new Set();
      
      this.graph.forEachNode((node, attr) => {
          if (attr.type === 'THOUGHT' && attr.content) {
              const hash = attr.content.substring(0, 50); // Simple content hash
              if (seenContent.has(hash)) {
                  this.graph.dropNode(node);
              } else {
                  seenContent.add(hash);
              }
          }
      });
      
      if (initialOrder > this.graph.order) {
          logger.info(`[MNEMOSYNE] 🧹 Pruned ${initialOrder - this.graph.order} duplicate thoughts.`);
          this.saveState();
      }
  }

  async saveState() {
      try {
          if (this.graph.order > 0) {
              await fs.writeFile(this.graphPath, JSON.stringify(this.graph.export()));
          }
          if (this.vectorStore.length > 0) {
              await fs.writeFile(this.vectorPath, JSON.stringify(this.vectorStore));
          }
      } catch (e) {
          logger.error("Memory Save Failed", e);
      }
  }

  async saveShortTerm(source, content) {
    const nodeId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    if (!this.graph.hasNode(source)) this.graph.addNode(source, { type: 'AGENT' });
    this.graph.addNode(nodeId, { type: 'THOUGHT', content: JSON.stringify(content) });
    this.graph.addEdge(source, nodeId);
    await this.saveState();
  }

  async saveLongTerm(content, metadata = {}) {
    const embedding = await cerebro.embed(content);
    this.vectorStore.push({ content, metadata, embedding, id: Date.now() });
    
    const memId = `mem-${Date.now()}`;
    this.graph.addNode(memId, { type: 'MEMORY', content, metadata });
    
    await this.saveState();
    logger.info('MNEMOSYNE: Memory Crystallized.');
  }

  async recall(query) {
    const q = query.toLowerCase();
    const results = this.vectorStore.filter(v => 
        (typeof v.content === 'string' && v.content.toLowerCase().includes(q))
    ).slice(0, 5);
    return results;
  }

  async getLessons(tag) {
      return this.vectorStore
        .filter(v => v.metadata?.tags?.includes(tag) || (v.content && typeof v.content === 'string' && v.content.includes("FAILURE")))
        .map(v => v.content);
  }

  getGraphSize() {
      return this.graph.order;
  }
}

export const mnemosyne = new Mnemosyne();
