/**
 * mapper.ts — Rule table: BaseArchitecture → PanelSection[] scaffold
 *
 * Pure rule-based. No LLM dependency. Every architecture maps to a predictable
 * set of section types. The adapter enriches these with real dataKeys and actionNames.
 */

import type {
  BaseArchitecture,
  PanelSection,
  DataOutputDeclaration,
  EditToolDeclaration,
} from './types';

export interface SectionScaffold {
  /** Ordered section type stubs — dataKey/action populated by adapter.ts */
  sections: Array<{ type: string; id: string; title?: string; [key: string]: unknown }>;
  /** Preferred layout */
  layout: 'single-column' | 'two-column';
}

/**
 * Returns the base section scaffold for a given architecture.
 * IDs are deterministic strings; the adapter fills in runtime values.
 */
export function getScaffold(arch: BaseArchitecture): SectionScaffold {
  switch (arch) {
    case 'calendar-view':
      return {
        layout: 'two-column',
        sections: [
          { type: 'card-list',    id: 'events',       title: 'Upcoming Events',  dataKey: '__PRIMARY__', titleKey: 'title', subtitleKey: 'startAt', metaKey: 'location' },
          { type: 'toggle',       id: 'show-all-day', title: undefined,           label: 'Show all-day events', action: '__TOGGLE_ACTION__', paramName: 'showAllDay' },
          { type: 'action-form',  id: 'create-event', title: 'Quick Create',      action: '__CREATE_ACTION__', submitLabel: 'Create event', fields: [
            { name: 'title',   label: 'Title',      inputType: 'text',   required: true },
            { name: 'startAt', label: 'Start',      inputType: 'date',   required: true },
            { name: 'endAt',   label: 'End',        inputType: 'date',   required: true },
            { name: 'location',label: 'Location',   inputType: 'text' },
          ]},
        ],
      };

    case 'table':
      return {
        layout: 'single-column',
        sections: [
          { type: 'tag-input', id: 'filter-tags', title: 'Filter', action: '__FILTER_ACTION__', paramName: 'tags', placeholder: 'Filter by tag…' },
          { type: 'table',     id: 'primary-table', title: 'Records', dataKey: '__PRIMARY__', columns: [
            { key: 'title', label: 'Name',   type: 'text' },
            { key: 'date',  label: 'Date',   type: 'date' },
            { key: 'status',label: 'Status', type: 'badge' },
          ]},
        ],
      };

    case 'form-result':
      return {
        layout: 'two-column',
        sections: [
          { type: 'action-form',  id: 'primary-form',    title: 'Inputs',   action: '__PRIMARY_ACTION__', submitLabel: 'Submit', fields: [] },
          { type: 'text-summary', id: 'result-summary',  title: 'Result',   dataKey: '__RESULT__' },
          { type: 'card-list',    id: 'history',         title: 'History',  dataKey: '__HISTORY__', titleKey: 'label', subtitleKey: 'createdAt' },
        ],
      };

    case 'dashboard':
      return {
        layout: 'two-column',
        sections: [
          { type: 'text-summary', id: 'headline-metric', title: 'Summary',     dataKey: '__METRIC__' },
          { type: 'table',        id: 'breakdown-table', title: 'Breakdown',   dataKey: '__BREAKDOWN__', columns: [
            { key: 'category', label: 'Category', type: 'text' },
            { key: 'value',    label: 'Value',    type: 'text' },
            { key: 'pct',      label: '%',        type: 'text' },
          ]},
          { type: 'text-list', id: 'insights', title: 'Insights', dataKey: '__INSIGHTS__' },
        ],
      };

    case 'card-feed':
      return {
        layout: 'single-column',
        sections: [
          { type: 'tag-input',  id: 'feed-filter', title: undefined,    action: '__FILTER_ACTION__', paramName: 'tags', placeholder: 'Filter…' },
          { type: 'select',     id: 'feed-sort',   title: undefined,    options: [{ value: 'recent', label: 'Most recent' }, { value: 'az', label: 'A–Z' }], action: '__SORT_ACTION__', paramName: 'sortBy' },
          { type: 'card-list',  id: 'primary-feed',title: undefined,    dataKey: '__PRIMARY__', titleKey: 'title', subtitleKey: 'subtitle', metaKey: 'meta' },
        ],
      };

    case 'settings-form':
      return {
        layout: 'two-column',
        sections: [
          { type: 'action-form', id: 'config-form',   title: 'Configuration', action: '__CONFIG_ACTION__', submitLabel: 'Save', fields: [] },
          { type: 'card-list',   id: 'records-list',  title: 'Records',       dataKey: '__PRIMARY__', titleKey: 'title', subtitleKey: 'label', metaKey: 'source' },
        ],
      };

    case 'chat-augment':
      return {
        layout: 'single-column',
        sections: [
          { type: 'text-summary', id: 'last-context',   title: 'Last Context Push',  dataKey: '__SUMMARY__' },
          { type: 'text-list',    id: 'pending-actions', title: 'Pending Actions',   dataKey: '__PENDING__' },
        ],
      };

    case 'flow-wizard':
      return {
        layout: 'single-column',
        sections: [
          { type: 'action-form',  id: 'wizard-step-1', title: 'Step 1',       action: '__STEP1_ACTION__', submitLabel: 'Next', fields: [] },
          { type: 'text-summary', id: 'confirmation',  title: 'Confirmation', dataKey: '__CONFIRMATION__' },
        ],
      };

    default: {
      const _exhaustive: never = arch;
      throw new Error(`Unknown architecture: ${_exhaustive}`);
    }
  }
}

/**
 * Given a dataOutput type, return sensible default column definitions for table sections.
 */
export function defaultColumnsForOutput(outputType: DataOutputDeclaration['type']): Array<{ key: string; label: string; type: 'text' | 'date' | 'badge' }> {
  switch (outputType) {
    case 'calendar-events':
      return [
        { key: 'title',    label: 'Event',    type: 'text' },
        { key: 'startAt',  label: 'Date',     type: 'date' },
        { key: 'location', label: 'Location', type: 'text' },
      ];
    case 'task-list':
      return [
        { key: 'title',    label: 'Task',     type: 'text' },
        { key: 'dueAt',    label: 'Due',      type: 'date' },
        { key: 'priority', label: 'Priority', type: 'badge' },
      ];
    case 'scored-list':
      return [
        { key: 'title',    label: 'Item',     type: 'text' },
        { key: 'score',    label: 'Score',    type: 'badge' },
        { key: 'reason',   label: 'Reason',   type: 'text' },
      ];
    case 'contact-list':
      return [
        { key: 'name',        label: 'Name',         type: 'text' },
        { key: 'email',       label: 'Email',        type: 'text' },
        { key: 'lastContact', label: 'Last Contact', type: 'date' },
      ];
    case 'booking-record':
      return [
        { key: 'guestName', label: 'Guest',  type: 'text' },
        { key: 'slotAt',    label: 'Time',   type: 'date' },
        { key: 'status',    label: 'Status', type: 'badge' },
      ];
    case 'payment-record':
      return [
        { key: 'label',       label: 'Description', type: 'text' },
        { key: 'amountCents', label: 'Amount',       type: 'text' },
        { key: 'status',      label: 'Status',       type: 'badge' },
      ];
    case 'supply-chain-record':
      return [
        { key: 'name',          label: 'Scenario',    type: 'text' },
        { key: 'productType',   label: 'Product',     type: 'text' },
        { key: 'totalCostUSD',  label: 'Total Cost',  type: 'text' },
      ];
    default:
      return [
        { key: 'title',     label: 'Name',   type: 'text' },
        { key: 'createdAt', label: 'Date',   type: 'date' },
        { key: 'status',    label: 'Status', type: 'badge' },
      ];
  }
}

/**
 * Returns the preferred actionName from editTools for a given edit tool type.
 */
export function resolveAction(
  editTools: EditToolDeclaration[],
  preferredTypes: EditToolDeclaration['type'][],
): string {
  for (const t of preferredTypes) {
    const tool = editTools.find(e => e.type === t);
    if (tool) return tool.actionName;
  }
  return editTools[0]?.actionName ?? '';
}


