/**
 * Local type mirrors for the SDK types used by the adapter.
 * These match the definitions in skillz-agents/shared/sdk/src/types.ts.
 * We mirror them here so the adapter core has zero runtime dependency on the agents repo.
 */

export type BaseArchitecture =
  | 'calendar-view'
  | 'table'
  | 'form-result'
  | 'dashboard'
  | 'card-feed'
  | 'settings-form'
  | 'chat-augment'
  | 'flow-wizard';

export type DataSourceType =
  | 'google-calendar' | 'outlook-calendar' | 'ical-feed'
  | 'todoist' | 'notion' | 'gmail' | 'google-maps'
  | 'google-places' | 'google-people' | 'sendgrid'
  | 'web-scraper' | 'gemini-search'
  | 'supabase-internal' | 'llm-inference' | 'stripe'
  | 'agent-output';

export interface DataSourceDeclaration {
  type: DataSourceType;
  label: string;
  required: boolean;
  meta?: string;
}

export type DataOutputType =
  | 'calendar-events' | 'task-list' | 'contact-list'
  | 'metrics-chart' | 'text-summary' | 'notification'
  | 'email' | 'booking-record' | 'payment-record'
  | 'scored-list' | 'travel-buffer-event' | 'trend-report'
  | 'social-plan' | 'supply-chain-record' | 'recommendation-list';

export interface DataOutputDeclaration {
  type: DataOutputType;
  label: string;
  rawContextKey: string;
}

export type EditToolType =
  | 'calendar-card-editor' | 'table-row-editor' | 'form-submit'
  | 'tag-input' | 'toggle-switch' | 'select-dropdown'
  | 'drag-reorder' | 'inline-text-edit';

export interface EditToolDeclaration {
  type: EditToolType;
  actionName: string;
  label: string;
}

export interface DataContributionDeclaration {
  targetAgentId: string;
  targetDataKey:  string;
  fromOutputKey:  string;
  mergeStrategy:  'append' | 'augment' | 'replace';
  label:          string;
  conditional?:   boolean;
}

export interface AgentToolDeclaration {
  agentId:    string;
  actionName: string;
  label:      string;
  invokeOn:   'on-action' | 'on-context';
}

export interface AgentUXSpec {
  baseArchitecture: BaseArchitecture;
  dataSources:  DataSourceDeclaration[];
  dataOutputs:  DataOutputDeclaration[];
  editTools:    EditToolDeclaration[];
  contributes?: DataContributionDeclaration[];
  agentTools?:  AgentToolDeclaration[];
  autoAdapt?:   boolean;
  /** UI nesting: this agent renders nested inside the specified parent agent's panel. */
  parentAgentId?: string;
  /** UI nesting: these agents render as embedded panels inside this agent's view. */
  childAgentIds?: string[];
}

// ─── Panel Spec (mirrors AgentPanelSpec from SDK) ─────────────────────────────

export interface AgentPanelSpec {
  layout: 'single-column' | 'two-column' | 'tabbed';
  brandedHeader?: {
    logoUrl: string;
    brandColor: string;
    appName: string;
    focusDescription: string;
  };
  sections: PanelSection[];
}

export type PanelSection =
  | TextSummarySection
  | TextListSection
  | TagInputSection
  | SelectSection
  | ToggleSection
  | TableSection
  | CardListSection
  | ActionFormSection
  | AgentEmbedSection;

interface BasePanelSection {
  id: string;
  title?: string;
}

export interface TextSummarySection extends BasePanelSection {
  type: 'text-summary';
  dataKey: string;
}

export interface TextListSection extends BasePanelSection {
  type: 'text-list';
  dataKey: string;
}

export interface TagInputSection extends BasePanelSection {
  type: 'tag-input';
  action: string;
  paramName: string;
  placeholder?: string;
}

export interface SelectSection extends BasePanelSection {
  type: 'select';
  options: Array<{ value: string; label: string }>;
  action: string;
  paramName: string;
}

export interface ToggleSection extends BasePanelSection {
  type: 'toggle';
  label: string;
  action: string;
  paramName: string;
}

export interface TableSection extends BasePanelSection {
  type: 'table';
  dataKey: string;
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'date' | 'badge' | 'action-button';
    actionName?: string;
    badgeColors?: Record<string, string>;
  }>;
}

export interface CardListSection extends BasePanelSection {
  type: 'card-list';
  dataKey: string;
  titleKey: string;
  subtitleKey?: string;
  metaKey?: string;
  actionButton?: {
    label: string;
    actionName: string;
    paramKey: string;
  };
}

export interface ActionFormSection extends BasePanelSection {
  type: 'action-form';
  action: string;
  submitLabel: string;
  fields: Array<{
    name: string;
    label: string;
    inputType: 'text' | 'number' | 'date' | 'select' | 'textarea';
    required?: boolean;
    options?: string[];
    defaultValue?: string;
  }>;
}

/** Renders another agent's panel nested inside this agent's panel. */
export interface AgentEmbedSection extends BasePanelSection {
  type: 'agent-embed';
  agentId: string;
  label: string;
  position: 'sidebar' | 'inline' | 'modal';
  invokeOn: 'on-action' | 'on-context' | 'always';
}

// ─── Suggestion types ─────────────────────────────────────────────────────────

export interface EmbeddedAgentDeclaration {
  agentId: string;
  label: string;
  position: 'sidebar' | 'inline' | 'modal';
  invokeOn: 'on-action' | 'on-context' | 'always';
}

export interface SuggestionResult {
  /** The field being suggested */
  field: keyof AgentUXSpec;
  suggestions: Array<{
    value: unknown;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

export interface SuggestContext {
  agentName?: string;
  description?: string;
}

export interface AdaptOptions {
  /** Use LLM to fill gaps the rule engine cannot handle (dev portal suggest only) */
  llmFallback?: boolean;
  apiKey?: string;
}
