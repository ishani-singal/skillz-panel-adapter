// @ts-nocheck — MCP SDK generics cause TS2589 deep type instantiation; this is a runtime binary only
/**
 * skillz-panel-adapter MCP Server
 *
 * Exposes three tools to AI coding assistants (Claude Code, etc.):
 *   adapt_spec       — Convert a uiSpec JSON to a panelSpec
 *   suggest_sections — Suggest the next field for a partial uiSpec
 *   validate_spec    — Validate a uiSpec and return any errors
 *
 * Run with: npx @modelcontextprotocol/inspector node dist/server.js
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { adapt, suggest, validateUXSpec } from '@skillz/panel-adapter-core';
import type { AgentUXSpec } from '@skillz/panel-adapter-core';

const server = new McpServer({
  name: 'skillz-panel-adapter',
  version: '0.1.0',
});

// ── Tool: adapt_spec ──────────────────────────────────────────────────────────

server.tool(
  'adapt_spec',
  'Convert an AgentUXSpec JSON object into a renderable AgentPanelSpec. ' +
  'Use this when building a Skillz agent to auto-generate its panel layout.',
  {
    uiSpec: z.string().describe('AgentUXSpec as a JSON string'),
  },
  async ({ uiSpec }) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(uiSpec);
    } catch {
      return { content: [{ type: 'text', text: 'Error: uiSpec is not valid JSON.' }] };
    }

    const validation = validateUXSpec(parsed);
    if (!validation.valid) {
      return {
        content: [{
          type: 'text',
          text: 'Validation errors:\n' + validation.errors.map(e => `  ${e.path}: ${e.message}`).join('\n'),
        }],
      };
    }

    const panelSpec = adapt(parsed as AgentUXSpec);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(panelSpec, null, 2),
      }],
    };
  },
);

// ── Tool: suggest_sections ────────────────────────────────────────────────────

server.tool(
  'suggest_sections',
  'Given a partially-filled AgentUXSpec, suggest what to fill in next. ' +
  'Provide a description of your agent for better suggestions.',
  {
    partial:     z.string().describe('Partial AgentUXSpec as JSON string (can be {})'),
    agentName:   z.string().optional().describe('Agent name'),
    description: z.string().optional().describe('Agent description in plain English'),
  },
  async ({ partial, agentName, description }) => {
    let parsed: Partial<AgentUXSpec>;
    try {
      parsed = JSON.parse(partial) as Partial<AgentUXSpec>;
    } catch {
      return { content: [{ type: 'text', text: 'Error: partial is not valid JSON.' }] };
    }

    const suggestion = suggest(parsed, { agentName, description });
    const lines = [
      `Suggested field: **${suggestion.field}**`,
      '',
      ...suggestion.suggestions.map((s, i) =>
        `${i + 1}. [${s.confidence.toUpperCase()}] ${JSON.stringify(s.value)}\n   Reason: ${s.reason}`
      ),
    ];

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

// ── Tool: validate_spec ───────────────────────────────────────────────────────

server.tool(
  'validate_spec',
  'Validate an AgentUXSpec against the Skillz schema. Returns validation errors if any.',
  {
    uiSpec: z.string().describe('AgentUXSpec as a JSON string'),
  },
  async ({ uiSpec }) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(uiSpec);
    } catch {
      return { content: [{ type: 'text', text: 'Error: uiSpec is not valid JSON.' }] };
    }

    const result = validateUXSpec(parsed);
    if (result.valid) {
      return { content: [{ type: 'text', text: '✅ Spec is valid.' }] };
    }

    const lines = ['❌ Validation errors:', ...result.errors.map(e => `  ${e.path || '(root)'}: ${e.message}`)];
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

// ── Start server ──────────────────────────────────────────────────────────────

void (async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('skillz-panel-adapter MCP server running on stdio');
})();
