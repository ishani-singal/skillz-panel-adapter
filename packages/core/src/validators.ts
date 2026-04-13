/**
 * validators.ts — Zod schemas for AgentUXSpec validation
 */

import { z } from 'zod';

export const BaseArchitectureSchema = z.enum([
  'calendar-view', 'table', 'form-result', 'dashboard',
  'card-feed', 'settings-form', 'chat-augment', 'flow-wizard',
]);

export const DataSourceTypeSchema = z.enum([
  'google-calendar', 'outlook-calendar', 'ical-feed', 'todoist', 'notion',
  'gmail', 'google-maps', 'google-places', 'google-people', 'sendgrid',
  'web-scraper', 'gemini-search', 'supabase-internal', 'llm-inference',
  'stripe', 'agent-output',
]);

export const DataOutputTypeSchema = z.enum([
  'calendar-events', 'task-list', 'contact-list', 'metrics-chart',
  'text-summary', 'notification', 'email', 'booking-record', 'payment-record',
  'scored-list', 'travel-buffer-event', 'trend-report', 'social-plan',
  'supply-chain-record', 'recommendation-list',
]);

export const EditToolTypeSchema = z.enum([
  'calendar-card-editor', 'table-row-editor', 'form-submit',
  'tag-input', 'toggle-switch', 'select-dropdown',
  'drag-reorder', 'inline-text-edit',
]);

export const DataSourceDeclarationSchema = z.object({
  type:     DataSourceTypeSchema,
  label:    z.string().min(1),
  required: z.boolean(),
  meta:     z.string().optional(),
});

export const DataOutputDeclarationSchema = z.object({
  type:          DataOutputTypeSchema,
  label:         z.string().min(1),
  rawContextKey: z.string().min(1),
});

export const EditToolDeclarationSchema = z.object({
  type:       EditToolTypeSchema,
  actionName: z.string().min(1),
  label:      z.string().min(1),
});

export const DataContributionDeclarationSchema = z.object({
  targetAgentId:      z.string().min(1),
  targetDataKey:      z.string().min(1),
  fromOutputKey:      z.string().min(1),
  mergeStrategy:      z.enum(['append', 'augment', 'replace']),
  label:              z.string().min(1),
  conditional:        z.boolean().optional(),
  calendarRenderHint: z.enum(['block-event', 'event-badge', 'week-banner', 'sidebar-only']).optional(),
});

export const AgentToolDeclarationSchema = z.object({
  agentId:    z.string().min(1),
  actionName: z.string().min(1),
  label:      z.string().min(1),
  invokeOn:   z.enum(['on-action', 'on-context']),
});

export const AgentUXSpecSchema = z.object({
  baseArchitecture: BaseArchitectureSchema,
  dataSources:      z.array(DataSourceDeclarationSchema).min(1, 'At least one data source is required'),
  dataOutputs:      z.array(DataOutputDeclarationSchema).min(1, 'At least one data output is required'),
  editTools:        z.array(EditToolDeclarationSchema),
  contributes:      z.array(DataContributionDeclarationSchema).optional(),
  agentTools:       z.array(AgentToolDeclarationSchema).optional(),
  autoAdapt:        z.boolean().optional(),
  parentAgentId:    z.string().optional(),
  childAgentIds:    z.array(z.string()).optional(),
});

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: Array<{ path: string; message: string }> };

export function validateUXSpec(spec: unknown): ValidationResult {
  const result = AgentUXSpecSchema.safeParse(spec);
  if (result.success) return { valid: true };

  return {
    valid: false,
    errors: result.error.issues.map(issue => ({
      path:    issue.path.join('.'),
      message: issue.message,
    })),
  };
}
