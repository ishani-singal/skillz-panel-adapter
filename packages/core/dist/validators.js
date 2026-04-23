"use strict";
/**
 * validators.ts — Zod schemas for AgentUXSpec validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentUXSpecSchema = exports.AgentToolDeclarationSchema = exports.DataContributionDeclarationSchema = exports.EditToolDeclarationSchema = exports.EditToolFieldSchema = exports.DataOutputDeclarationSchema = exports.DataSourceDeclarationSchema = exports.EditToolTypeSchema = exports.DataOutputTypeSchema = exports.DataSourceTypeSchema = exports.BaseArchitectureSchema = void 0;
exports.validateUXSpec = validateUXSpec;
const zod_1 = require("zod");
exports.BaseArchitectureSchema = zod_1.z.enum([
    'calendar-view', 'table', 'form-result', 'dashboard',
    'card-feed', 'settings-form', 'chat-augment', 'flow-wizard',
]);
exports.DataSourceTypeSchema = zod_1.z.enum([
    'google-calendar', 'outlook-calendar', 'ical-feed', 'todoist', 'notion',
    'gmail', 'google-maps', 'google-places', 'google-people', 'sendgrid',
    'web-scraper', 'gemini-search', 'supabase-internal', 'llm-inference',
    'stripe', 'agent-output',
]);
exports.DataOutputTypeSchema = zod_1.z.enum([
    'calendar-events', 'task-list', 'contact-list', 'metrics-chart',
    'text-summary', 'notification', 'email', 'booking-record', 'payment-record',
    'scored-list', 'travel-buffer-event', 'travel-legs', 'trend-report', 'social-plan',
    'supply-chain-record', 'recommendation-list',
]);
exports.EditToolTypeSchema = zod_1.z.enum([
    'calendar-card-editor', 'table-row-editor', 'form-submit',
    'tag-input', 'toggle-switch', 'select-dropdown',
    'drag-reorder', 'inline-text-edit',
]);
exports.DataSourceDeclarationSchema = zod_1.z.object({
    type: exports.DataSourceTypeSchema,
    label: zod_1.z.string().min(1),
    required: zod_1.z.boolean(),
    meta: zod_1.z.string().optional(),
});
exports.DataOutputDeclarationSchema = zod_1.z.object({
    type: exports.DataOutputTypeSchema,
    label: zod_1.z.string().min(1),
    rawContextKey: zod_1.z.string().min(1),
});
exports.EditToolFieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    inputType: zod_1.z.enum(['text', 'number', 'date', 'select', 'textarea']),
    required: zod_1.z.boolean().optional(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    defaultValue: zod_1.z.string().optional(),
});
exports.EditToolDeclarationSchema = zod_1.z.object({
    type: exports.EditToolTypeSchema,
    actionName: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    fields: zod_1.z.array(exports.EditToolFieldSchema).optional(),
});
exports.DataContributionDeclarationSchema = zod_1.z.object({
    targetAgentId: zod_1.z.string().min(1),
    targetDataKey: zod_1.z.string().min(1),
    fromOutputKey: zod_1.z.string().min(1),
    mergeStrategy: zod_1.z.enum(['append', 'augment', 'replace']),
    label: zod_1.z.string().min(1),
    conditional: zod_1.z.boolean().optional(),
    calendarRenderHint: zod_1.z.enum(['block-event', 'event-badge', 'week-banner', 'sidebar-only']).optional(),
});
exports.AgentToolDeclarationSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    actionName: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    invokeOn: zod_1.z.enum(['on-action', 'on-context']),
});
exports.AgentUXSpecSchema = zod_1.z.object({
    baseArchitecture: exports.BaseArchitectureSchema,
    dataSources: zod_1.z.array(exports.DataSourceDeclarationSchema).min(1, 'At least one data source is required'),
    dataOutputs: zod_1.z.array(exports.DataOutputDeclarationSchema).min(1, 'At least one data output is required'),
    editTools: zod_1.z.array(exports.EditToolDeclarationSchema),
    contributes: zod_1.z.array(exports.DataContributionDeclarationSchema).optional(),
    agentTools: zod_1.z.array(exports.AgentToolDeclarationSchema).optional(),
    autoAdapt: zod_1.z.boolean().optional(),
    parentAgentId: zod_1.z.string().optional(),
    childAgentIds: zod_1.z.array(zod_1.z.string()).optional(),
});
function validateUXSpec(spec) {
    const result = exports.AgentUXSpecSchema.safeParse(spec);
    if (result.success)
        return { valid: true };
    return {
        valid: false,
        errors: result.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    };
}
//# sourceMappingURL=validators.js.map