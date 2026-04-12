/**
 * adapter.ts — Main adapt() function
 *
 * Converts an AgentUXSpec into a renderable AgentPanelSpec.
 * Purely rule-based — no LLM, no network calls, deterministic output.
 *
 * Algorithm:
 *   1. Get section scaffold from mapper.getScaffold(arch)
 *   2. Wire in dataKeys from the first matching DataOutputDeclaration
 *   3. Wire in action names from EditToolDeclarations
 *   4. Append agent-embed sections for each EmbeddedAgentDeclaration
 *   5. Set layout based on section count
 */

import {
  getScaffold,
  defaultColumnsForOutput,
  resolveAction,
} from './mapper';
import type {
  AgentUXSpec,
  AgentPanelSpec,
  PanelSection,
  AgentEmbedSection,
  AdaptOptions,
  DataOutputDeclaration,
  EditToolDeclaration,
} from './types';

export function adapt(spec: AgentUXSpec, _options?: AdaptOptions): AgentPanelSpec {
  const scaffold = getScaffold(spec.baseArchitecture);
  const primaryOutput: DataOutputDeclaration | undefined = spec.dataOutputs[0];
  const secondaryOutput: DataOutputDeclaration | undefined = spec.dataOutputs[1];

  // Deep-clone scaffold sections so we can mutate safely
  const sections: PanelSection[] = JSON.parse(JSON.stringify(scaffold.sections));

  // Wire each section with real data from the uiSpec
  for (const section of sections) {
    switch (section.type) {
      case 'card-list': {
        // Use primary output's rawContextKey as dataKey
        if ('dataKey' in section && section.dataKey === '__PRIMARY__') {
          section.dataKey = primaryOutput?.rawContextKey ?? 'items';
        }
        if ('dataKey' in section && section.dataKey === '__HISTORY__') {
          section.dataKey = secondaryOutput?.rawContextKey ?? 'history';
        }
        break;
      }

      case 'table': {
        if ('dataKey' in section) {
          if (section.dataKey === '__PRIMARY__' || section.dataKey === '__BREAKDOWN__') {
            section.dataKey = primaryOutput?.rawContextKey ?? 'items';
            // Replace generic columns with output-specific columns
            if ('columns' in section && primaryOutput) {
              (section as { columns: unknown[] }).columns = defaultColumnsForOutput(primaryOutput.type);
            }
          }
        }
        break;
      }

      case 'text-summary': {
        if ('dataKey' in section) {
          const key = section.dataKey as string;
          if (key === '__PRIMARY__' || key === '__METRIC__' || key === '__SUMMARY__' || key === '__RESULT__' || key === '__CONFIRMATION__') {
            section.dataKey = primaryOutput?.rawContextKey ?? 'summary';
          }
          if (key === '__RESULT__') {
            section.dataKey = secondaryOutput?.rawContextKey ?? primaryOutput?.rawContextKey ?? 'result';
          }
        }
        break;
      }

      case 'text-list': {
        if ('dataKey' in section) {
          const key = section.dataKey as string;
          if (key === '__INSIGHTS__' || key === '__PENDING__') {
            section.dataKey = secondaryOutput?.rawContextKey ?? primaryOutput?.rawContextKey ?? 'items';
          }
        }
        break;
      }

      case 'action-form': {
        if ('action' in section) {
          const actionPlaceholders = ['__PRIMARY_ACTION__', '__CREATE_ACTION__', '__CONFIG_ACTION__', '__STEP1_ACTION__'];
          if (actionPlaceholders.includes(section.action as string)) {
            section.action = resolveAction(spec.editTools, ['form-submit', 'calendar-card-editor']);
          }
          // Build form fields from editTools if empty
          if ('fields' in section && Array.isArray(section.fields) && section.fields.length === 0) {
            // Only populate if the developer provided no manual fields
            section.fields = buildFieldsFromEditTools(spec.editTools, section.action as string);
          }
        }
        break;
      }

      case 'toggle': {
        if ('action' in section && section.action === '__TOGGLE_ACTION__') {
          const toggleTool = spec.editTools.find(e => e.type === 'toggle-switch');
          if (toggleTool) {
            section.action = toggleTool.actionName;
            (section as { label: string }).label = toggleTool.label;
          }
        }
        break;
      }

      case 'tag-input': {
        if ('action' in section && (section.action === '__FILTER_ACTION__' || section.action === '')) {
          const tagTool = spec.editTools.find(e => e.type === 'tag-input');
          if (tagTool) section.action = tagTool.actionName;
        }
        break;
      }

      case 'select': {
        if ('action' in section && (section.action === '__SORT_ACTION__' || section.action === '')) {
          const selectTool = spec.editTools.find(e => e.type === 'select-dropdown');
          if (selectTool) section.action = selectTool.actionName;
        }
        break;
      }
    }
  }

  // Step 4: Append agent-embed sections for each child agent
  if (spec.childAgentIds && spec.childAgentIds.length > 0) {
    for (const childId of spec.childAgentIds) {
      const embedSection: AgentEmbedSection = {
        id: `embed-${childId}`,
        type: 'agent-embed',
        agentId: childId,
        label: childId,
        position: 'sidebar',
        invokeOn: 'always',
      };
      sections.push(embedSection);
    }
  }

  // Determine layout
  const sectionCount = sections.length;
  const layout: AgentPanelSpec['layout'] =
    scaffold.layout === 'two-column' ? 'two-column' :
    sectionCount >= 4 ? 'two-column' : 'single-column';

  return { layout, sections };
}

/**
 * Derive simple form fields from an editTool's actionName and the spec's outputs.
 * Only generates a minimal text field for the most common input parameters.
 * The developer portal can override these.
 */
function buildFieldsFromEditTools(
  editTools: EditToolDeclaration[],
  actionName: string,
): Array<{ name: string; label: string; inputType: 'text' | 'number' | 'date' | 'select' | 'textarea'; required?: boolean }> {
  const tool = editTools.find(e => e.actionName === actionName);
  if (!tool) return [];

  // Generic single-field form as a baseline — developer fills in proper fields
  // in the developer portal's customize step.
  return [
    { name: 'input', label: tool.label, inputType: 'text' as const, required: true },
  ];
}
