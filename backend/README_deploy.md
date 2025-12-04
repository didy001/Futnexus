# Nexus•3C Deployment Guide

## 1. Database (Supabase)
1. Create a new Supabase Project.
2. Go to SQL Editor.
3. Paste content from `backend/supabase_schema.sql`.
4. Run.

## 2. Kernel
1. Create a private GitHub repository `nexus-kernel`.
2. Push `backend/kernel.json` to `main`.
3. Create a Personal Access Token (PAT) for the Orchestrator to read this file.

## 3. Agents (Cloudflare Workers / Edge)
For each file in `backend/agents/*.js`:
1. Create a new Worker.
2. Copy the code.
3. Add `GEMINI_API_KEY` to environment variables.
4. Deploy and note the URL.

## 4. Orchestrator
1. Open `backend/orchestrator.js`.
2. Update `AGENT_REGISTRY` with the URLs from Step 3.
3. Deploy as a Worker or Edge Function.
4. Expose the URL as `NEXUS_ORCHESTRATOR_URL`.

## 5. Connect Frontend
1. Update `services/geminiService.ts` to POST to `NEXUS_ORCHESTRATOR_URL` instead of direct AI calls (optional, for full production mode).
