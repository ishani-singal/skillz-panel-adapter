/**
 * validators.ts — Zod schemas for AgentUXSpec validation
 */
import { z } from 'zod';
export declare const BaseArchitectureSchema: z.ZodEnum<["calendar-view", "table", "form-result", "dashboard", "card-feed", "settings-form", "chat-augment", "flow-wizard"]>;
export declare const DataSourceTypeSchema: z.ZodEnum<["google-calendar", "outlook-calendar", "ical-feed", "todoist", "notion", "gmail", "google-maps", "google-places", "google-people", "sendgrid", "web-scraper", "gemini-search", "supabase-internal", "llm-inference", "stripe", "agent-output"]>;
export declare const DataOutputTypeSchema: z.ZodEnum<["calendar-events", "task-list", "contact-list", "metrics-chart", "text-summary", "notification", "email", "booking-record", "payment-record", "scored-list", "travel-buffer-event", "travel-legs", "trend-report", "social-plan", "supply-chain-record", "recommendation-list"]>;
export declare const EditToolTypeSchema: z.ZodEnum<["calendar-card-editor", "table-row-editor", "form-submit", "tag-input", "toggle-switch", "select-dropdown", "drag-reorder", "inline-text-edit"]>;
export declare const DataSourceDeclarationSchema: z.ZodObject<{
    type: z.ZodEnum<["google-calendar", "outlook-calendar", "ical-feed", "todoist", "notion", "gmail", "google-maps", "google-places", "google-people", "sendgrid", "web-scraper", "gemini-search", "supabase-internal", "llm-inference", "stripe", "agent-output"]>;
    label: z.ZodString;
    required: z.ZodBoolean;
    meta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "google-calendar" | "outlook-calendar" | "ical-feed" | "todoist" | "notion" | "gmail" | "google-maps" | "google-places" | "google-people" | "sendgrid" | "web-scraper" | "gemini-search" | "supabase-internal" | "llm-inference" | "stripe" | "agent-output";
    label: string;
    required: boolean;
    meta?: string | undefined;
}, {
    type: "google-calendar" | "outlook-calendar" | "ical-feed" | "todoist" | "notion" | "gmail" | "google-maps" | "google-places" | "google-people" | "sendgrid" | "web-scraper" | "gemini-search" | "supabase-internal" | "llm-inference" | "stripe" | "agent-output";
    label: string;
    required: boolean;
    meta?: string | undefined;
}>;
export declare const DataOutputDeclarationSchema: z.ZodObject<{
    type: z.ZodEnum<["calendar-events", "task-list", "contact-list", "metrics-chart", "text-summary", "notification", "email", "booking-record", "payment-record", "scored-list", "travel-buffer-event", "travel-legs", "trend-report", "social-plan", "supply-chain-record", "recommendation-list"]>;
    label: z.ZodString;
    rawContextKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "calendar-events" | "task-list" | "contact-list" | "metrics-chart" | "text-summary" | "notification" | "email" | "booking-record" | "payment-record" | "scored-list" | "travel-buffer-event" | "trend-report" | "social-plan" | "supply-chain-record" | "recommendation-list" | "travel-legs";
    label: string;
    rawContextKey: string;
}, {
    type: "calendar-events" | "task-list" | "contact-list" | "metrics-chart" | "text-summary" | "notification" | "email" | "booking-record" | "payment-record" | "scored-list" | "travel-buffer-event" | "trend-report" | "social-plan" | "supply-chain-record" | "recommendation-list" | "travel-legs";
    label: string;
    rawContextKey: string;
}>;
export declare const EditToolFieldSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
    inputType: z.ZodEnum<["text", "number", "date", "select", "textarea"]>;
    required: z.ZodOptional<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    label: string;
    name: string;
    inputType: "number" | "text" | "date" | "select" | "textarea";
    required?: boolean | undefined;
    options?: string[] | undefined;
    defaultValue?: string | undefined;
}, {
    label: string;
    name: string;
    inputType: "number" | "text" | "date" | "select" | "textarea";
    required?: boolean | undefined;
    options?: string[] | undefined;
    defaultValue?: string | undefined;
}>;
export declare const EditToolDeclarationSchema: z.ZodObject<{
    type: z.ZodEnum<["calendar-card-editor", "table-row-editor", "form-submit", "tag-input", "toggle-switch", "select-dropdown", "drag-reorder", "inline-text-edit"]>;
    actionName: z.ZodString;
    label: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodString;
        inputType: z.ZodEnum<["text", "number", "date", "select", "textarea"]>;
        required: z.ZodOptional<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        defaultValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        name: string;
        inputType: "number" | "text" | "date" | "select" | "textarea";
        required?: boolean | undefined;
        options?: string[] | undefined;
        defaultValue?: string | undefined;
    }, {
        label: string;
        name: string;
        inputType: "number" | "text" | "date" | "select" | "textarea";
        required?: boolean | undefined;
        options?: string[] | undefined;
        defaultValue?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "calendar-card-editor" | "table-row-editor" | "form-submit" | "tag-input" | "toggle-switch" | "select-dropdown" | "drag-reorder" | "inline-text-edit";
    label: string;
    actionName: string;
    fields?: {
        label: string;
        name: string;
        inputType: "number" | "text" | "date" | "select" | "textarea";
        required?: boolean | undefined;
        options?: string[] | undefined;
        defaultValue?: string | undefined;
    }[] | undefined;
}, {
    type: "calendar-card-editor" | "table-row-editor" | "form-submit" | "tag-input" | "toggle-switch" | "select-dropdown" | "drag-reorder" | "inline-text-edit";
    label: string;
    actionName: string;
    fields?: {
        label: string;
        name: string;
        inputType: "number" | "text" | "date" | "select" | "textarea";
        required?: boolean | undefined;
        options?: string[] | undefined;
        defaultValue?: string | undefined;
    }[] | undefined;
}>;
export declare const DataContributionDeclarationSchema: z.ZodObject<{
    targetAgentId: z.ZodString;
    targetDataKey: z.ZodString;
    fromOutputKey: z.ZodString;
    mergeStrategy: z.ZodEnum<["append", "augment", "replace"]>;
    label: z.ZodString;
    conditional: z.ZodOptional<z.ZodBoolean>;
    calendarRenderHint: z.ZodOptional<z.ZodEnum<["block-event", "event-badge", "week-banner", "sidebar-only"]>>;
}, "strip", z.ZodTypeAny, {
    label: string;
    targetAgentId: string;
    targetDataKey: string;
    fromOutputKey: string;
    mergeStrategy: "append" | "augment" | "replace";
    conditional?: boolean | undefined;
    calendarRenderHint?: "block-event" | "event-badge" | "week-banner" | "sidebar-only" | undefined;
}, {
    label: string;
    targetAgentId: string;
    targetDataKey: string;
    fromOutputKey: string;
    mergeStrategy: "append" | "augment" | "replace";
    conditional?: boolean | undefined;
    calendarRenderHint?: "block-event" | "event-badge" | "week-banner" | "sidebar-only" | undefined;
}>;
export declare const AgentToolDeclarationSchema: z.ZodObject<{
    agentId: z.ZodString;
    actionName: z.ZodString;
    label: z.ZodString;
    invokeOn: z.ZodEnum<["on-action", "on-context"]>;
}, "strip", z.ZodTypeAny, {
    label: string;
    actionName: string;
    agentId: string;
    invokeOn: "on-action" | "on-context";
}, {
    label: string;
    actionName: string;
    agentId: string;
    invokeOn: "on-action" | "on-context";
}>;
export declare const AgentUXSpecSchema: z.ZodObject<{
    baseArchitecture: z.ZodEnum<["calendar-view", "table", "form-result", "dashboard", "card-feed", "settings-form", "chat-augment", "flow-wizard"]>;
    dataSources: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["google-calendar", "outlook-calendar", "ical-feed", "todoist", "notion", "gmail", "google-maps", "google-places", "google-people", "sendgrid", "web-scraper", "gemini-search", "supabase-internal", "llm-inference", "stripe", "agent-output"]>;
        label: z.ZodString;
        required: z.ZodBoolean;
        meta: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "google-calendar" | "outlook-calendar" | "ical-feed" | "todoist" | "notion" | "gmail" | "google-maps" | "google-places" | "google-people" | "sendgrid" | "web-scraper" | "gemini-search" | "supabase-internal" | "llm-inference" | "stripe" | "agent-output";
        label: string;
        required: boolean;
        meta?: string | undefined;
    }, {
        type: "google-calendar" | "outlook-calendar" | "ical-feed" | "todoist" | "notion" | "gmail" | "google-maps" | "google-places" | "google-people" | "sendgrid" | "web-scraper" | "gemini-search" | "supabase-internal" | "llm-inference" | "stripe" | "agent-output";
        label: string;
        required: boolean;
        meta?: string | undefined;
    }>, "many">;
    dataOutputs: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["calendar-events", "task-list", "contact-list", "metrics-chart", "text-summary", "notification", "email", "booking-record", "payment-record", "scored-list", "travel-buffer-event", "travel-legs", "trend-report", "social-plan", "supply-chain-record", "recommendation-list"]>;
        label: z.ZodString;
        rawContextKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "calendar-events" | "task-list" | "contact-list" | "metrics-chart" | "text-summary" | "notification" | "email" | "booking-record" | "payment-record" | "scored-list" | "travel-buffer-event" | "trend-report" | "social-plan" | "supply-chain-record" | "recommendation-list" | "travel-legs";
        label: string;
        rawContextKey: string;
    }, {
        type: "calendar-events" | "task-list" | "contact-list" | "metrics-chart" | "text-summary" | "notification" | "email" | "booking-record" | "payment-record" | "scored-list" | "travel-buffer-event" | "trend-report" | "social-plan" | "supply-chain-record" | "recommendation-list" | "travel-legs";
        label: string;
        rawContextKey: string;
    }>, "many">;
    editTools: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["calendar-card-editor", "table-row-editor", "form-submit", "tag-input", "toggle-switch", "select-dropdown", "drag-reorder", "inline-text-edit"]>;
        actionName: z.ZodString;
        label: z.ZodString;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            label: z.ZodString;
            inputType: z.ZodEnum<["text", "number", "date", "select", "textarea"]>;
            required: z.ZodOptional<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            name: string;
            inputType: "number" | "text" | "date" | "select" | "textarea";
            required?: boolean | undefined;
            options?: string[] | undefined;
            defaultValue?: string | undefined;
        }, {
            label: string;
            name: string;
            inputType: "number" | "text" | "date" | "select" | "textarea";
            required?: boolean | undefined;
            options?: string[] | undefined;
            defaultValue?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "calendar-card-editor" | "table-row-editor" | "form-submit" | "tag-input" | "toggle-switch" | "select-dropdown" | "drag-reorder" | "inline-text-edit";
        label: string;
        actionName: string;
        fields?: {
            label: string;
            name: string;
            inputType: "number" | "text" | "date" | "select" | "textarea";
            required?: boolean | undefined;
            options?: string[] | undefined;
            defaultValue?: string | undefined;
        }[] | undefined;
    }, {
        type: "calendar-card-editor" | "table-row-editor" | "form-submit" | "tag-input" | "toggle-switch" | "select-dropdown" | "drag-reorder" | "inline-text-edit";
        label: string;
        actionName: string;
        fields?: {
            label: string;
            name: string;
            inputType: "number" | "text" | "date" | "select" | "textarea";
            required?: boolean | undefined;
            options?: string[] | undefined;
            defaultValue?: string | undefined;
        }[] | undefined;
    }>, "many">;
    contributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        targetAgentId: z.ZodString;
        targetDataKey: z.ZodString;
        fromOutputKey: z.ZodString;
        mergeStrategy: z.ZodEnum<["append", "augment", "replace"]>;
        label: z.ZodString;
        conditional: z.ZodOptional<z.ZodBoolean>;
        calendarRenderHint: z.ZodOptional<z.ZodEnum<["block-event", "event-badge", "week-banner", "sidebar-only"]>>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        targetAgentId: string;
        targetDataKey: string;
        fromOutputKey: string;
        mergeStrategy: "append" | "augment" | "replace";
        conditional?: boolean | undefined;
        calendarRenderHint?: "block-event" | "event-badge" | "week-banner" | "sidebar-only" | undefined;
    }, {
        label: string;
        targetAgentId: string;
        targetDataKey: string;
        fromOutputKey: string;
        mergeStrategy: "append" | "augment" | "replace";
        conditional?: boolean | undefined;
        calendarRenderHint?: "block-event" | "event-badge" | "week-banner" | "sidebar-only" | undefined;
    }>, "many">>;
    agentTools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        actionName: z.ZodString;
        label: z.ZodString;
        invokeOn: z.ZodEnum<["on-action", "on-context"]>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        actionName: string;
        agentId: string;
        invokeOn: "on-action" | "on-context";
    }, {
        label: string;
        actionName: string;
        agentId: string;
        invokeOn: "on-action" | "on-context";
    }>, "many">>;
    autoAdapt: z.ZodOptional<z.ZodBoolean>;
    parentAgentId: z.ZodOptional<z.ZodString>;
    childAgentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    baseArchitecture: "calendar-view" | "table" | "form-result" | "dashboard" | "card-feed" | "settings-form" | "chat-augment" | "flow-wizard";
    dataSources: {
        type: "google-calendar" | "outlook-calendar" | "ical-feed" | "todoist" | "notion" | "gmail" | "google-maps" | "google-places" | "google-people" | "sendgrid" | "web-scraper" | "gemini-search" | "supabase-internal" | "llm-inference" | "stripe" | "agent-output";
        label: string;
        required: boolean;
        meta?: string | undefined;
    }[];
    dataOutputs: {
        type: "calendar-events" | "task-list" | "contact-list" | "metrics-chart" | "text-summary" | "notification" | "email" | "booking-record" | "payment-record" | "scored-list" | "travel-buffer-event" | "trend-report" | "social-plan" | "supply-chain-record" | "recommendation-list" | "travel-legs";
        label: string;
        rawContextKey: string;
    }[];
    editTools: {
        type: "calendar-card-editor" | "table-row-editor" | "form-submit" | "tag-input" | "toggle-switch" | "select-dropdown" | "drag-reorder" | "inline-text-edit";
        label: string;
        actionName: string;
        fields?: {
            label: string;
            name: string;
            inputType: "number" | "text" | "date" | "select" | "textarea";
            required?: boolean | undefined;
            options?: string[] | undefined;
            defaultValue?: string | undefined;
        }[] | undefined;
    }[];
    contributes?: {
        label: string;
        targetAgentId: string;
        targetDataKey: string;
        fromOutputKey: string;
        mergeStrategy: "append" | "augment" | "replace";
        conditional?: boolean | undefined;
        calendarRenderHint?: "block-event" | "event-badge" | "week-banner" | "sidebar-only" | undefined;
    }[] | undefined;
    agentTools?: {
        label: string;
        actionName: string;
        agentId: string;
        invokeOn: "on-action" | "on-context";
    }[] | undefined;
    autoAdapt?: boolean | undefined;
    parentAgentId?: string | undefined;
    childAgentIds?: string[] | undefined;
}, {
    baseArchitecture: "calendar-view" | "table" | "form-result" | "dashboard" | "card-feed" | "settings-form" | "chat-augment" | "flow-wizard";
    dataSources: {
        type: "google-calendar" | "outlook-calendar" | "ical-feed" | "todoist" | "notion" | "gmail" | "google-maps" | "google-places" | "google-people" | "sendgrid" | "web-scraper" | "gemini-search" | "supabase-internal" | "llm-inference" | "stripe" | "agent-output";
        label: string;
        required: boolean;
        meta?: string | undefined;
    }[];
    dataOutputs: {
        type: "calendar-events" | "task-list" | "contact-list" | "metrics-chart" | "text-summary" | "notification" | "email" | "booking-record" | "payment-record" | "scored-list" | "travel-buffer-event" | "trend-report" | "social-plan" | "supply-chain-record" | "recommendation-list" | "travel-legs";
        label: string;
        rawContextKey: string;
    }[];
    editTools: {
        type: "calendar-card-editor" | "table-row-editor" | "form-submit" | "tag-input" | "toggle-switch" | "select-dropdown" | "drag-reorder" | "inline-text-edit";
        label: string;
        actionName: string;
        fields?: {
            label: string;
            name: string;
            inputType: "number" | "text" | "date" | "select" | "textarea";
            required?: boolean | undefined;
            options?: string[] | undefined;
            defaultValue?: string | undefined;
        }[] | undefined;
    }[];
    contributes?: {
        label: string;
        targetAgentId: string;
        targetDataKey: string;
        fromOutputKey: string;
        mergeStrategy: "append" | "augment" | "replace";
        conditional?: boolean | undefined;
        calendarRenderHint?: "block-event" | "event-badge" | "week-banner" | "sidebar-only" | undefined;
    }[] | undefined;
    agentTools?: {
        label: string;
        actionName: string;
        agentId: string;
        invokeOn: "on-action" | "on-context";
    }[] | undefined;
    autoAdapt?: boolean | undefined;
    parentAgentId?: string | undefined;
    childAgentIds?: string[] | undefined;
}>;
export type ValidationResult = {
    valid: true;
} | {
    valid: false;
    errors: Array<{
        path: string;
        message: string;
    }>;
};
export declare function validateUXSpec(spec: unknown): ValidationResult;
//# sourceMappingURL=validators.d.ts.map