/**
 * skillz-panel-adapter REST API
 *
 * Endpoints:
 *   POST /adapt    — { uiSpec } → { panelSpec }
 *   POST /suggest  — { partial, agentName?, description? } → { suggestion }
 *   POST /validate — { uiSpec } → { valid, errors? }
 *   GET  /health
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { adapt, suggest, validateUXSpec } from '@skillz/panel-adapter-core';
import type { AgentUXSpec } from '@skillz/panel-adapter-core';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

// Only allow requests from the shell (Azure App Service) or localhost in dev.
// SHELL_URL must be set in the Docker environment (e.g. https://skillz-app.azurewebsites.net).
const allowedOrigins = [
  process.env.SHELL_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header) and explicitly listed origins.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '256kb' }));

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skillz-panel-adapter', version: '0.1.0' });
});

// ── POST /adapt ───────────────────────────────────────────────────────────────

app.post('/adapt', (req: Request, res: Response) => {
  const { uiSpec, options } = req.body as { uiSpec: unknown; options?: unknown };

  if (!uiSpec || typeof uiSpec !== 'object') {
    return res.status(400).json({ error: '`uiSpec` is required and must be an object.' });
  }

  const validation = validateUXSpec(uiSpec);
  if (!validation.valid) {
    return res.status(422).json({ error: 'Invalid uiSpec', details: validation.errors });
  }

  try {
    const panelSpec = adapt(uiSpec as AgentUXSpec, options as never);
    return res.json({ panelSpec });
  } catch (err) {
    return res.status(500).json({ error: 'Adapt failed', detail: String(err) });
  }
});

// ── POST /suggest ─────────────────────────────────────────────────────────────

app.post('/suggest', (req: Request, res: Response) => {
  const { partial, agentName, description } = req.body as {
    partial: Partial<AgentUXSpec>;
    agentName?: string;
    description?: string;
  };

  if (!partial || typeof partial !== 'object') {
    return res.status(400).json({ error: '`partial` is required and must be an object.' });
  }

  try {
    const suggestion = suggest(partial, { agentName, description });
    return res.json({ suggestion });
  } catch (err) {
    return res.status(500).json({ error: 'Suggest failed', detail: String(err) });
  }
});

// ── POST /validate ────────────────────────────────────────────────────────────

app.post('/validate', (req: Request, res: Response) => {
  const { uiSpec } = req.body as { uiSpec: unknown };

  if (!uiSpec) {
    return res.status(400).json({ error: '`uiSpec` is required.' });
  }

  const result = validateUXSpec(uiSpec);
  return res.json(result);
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`skillz-panel-adapter API running on port ${PORT}`);
});

export default app;
