"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapt = adapt;
const mapper_1 = require("./mapper");
function adapt(spec, _options) {
    const scaffold = (0, mapper_1.getScaffold)(spec.baseArchitecture);
    const primaryOutput = spec.dataOutputs[0];
    const secondaryOutput = spec.dataOutputs[1];
    // Deep-clone scaffold sections so we can mutate safely
    const sections = JSON.parse(JSON.stringify(scaffold.sections));
    // Wire each section with real data from the uiSpec
    for (const section of sections) {
        switch (section.type) {
            case 'card-list': {
                // Use primary output's rawContextKey as dataKey
                if ('dataKey' in section && section.dataKey === '__PRIMARY__') {
                    section.dataKey = primaryOutput?.rawContextKey ?? 'items';
                }
                // __HISTORY__ is a past-results list — wire to primaryOutput (the main data store),
                // not secondaryOutput (which is the result scalar used by text-summary).
                if ('dataKey' in section && section.dataKey === '__HISTORY__') {
                    section.dataKey = primaryOutput?.rawContextKey ?? 'history';
                }
                // Wire the first toggle-switch editTool as a per-card action button (e.g. Discard)
                const toggleTool = spec.editTools.find(e => e.type === 'toggle-switch');
                if (toggleTool) {
                    section.actionButton = {
                        label: toggleTool.label,
                        actionName: toggleTool.actionName,
                        paramKey: 'id',
                    };
                }
                break;
            }
            case 'table': {
                if ('dataKey' in section) {
                    if (section.dataKey === '__PRIMARY__' || section.dataKey === '__BREAKDOWN__') {
                        section.dataKey = primaryOutput?.rawContextKey ?? 'items';
                        // Replace generic columns with output-specific columns
                        if ('columns' in section && primaryOutput) {
                            section.columns = (0, mapper_1.defaultColumnsForOutput)(primaryOutput.type);
                        }
                    }
                }
                break;
            }
            case 'text-summary': {
                if ('dataKey' in section) {
                    const key = section.dataKey;
                    if (key === '__PRIMARY__' || key === '__METRIC__' || key === '__SUMMARY__' || key === '__CONFIRMATION__') {
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
                    const key = section.dataKey;
                    if (key === '__INSIGHTS__' || key === '__PENDING__') {
                        section.dataKey = secondaryOutput?.rawContextKey ?? primaryOutput?.rawContextKey ?? 'items';
                    }
                }
                break;
            }
            case 'action-form': {
                if ('action' in section) {
                    const actionPlaceholders = ['__PRIMARY_ACTION__', '__CREATE_ACTION__', '__CONFIG_ACTION__', '__STEP1_ACTION__'];
                    if (actionPlaceholders.includes(section.action)) {
                        section.action = (0, mapper_1.resolveAction)(spec.editTools, ['form-submit', 'calendar-card-editor']);
                    }
                    // Build form fields from editTools if empty
                    if ('fields' in section && Array.isArray(section.fields) && section.fields.length === 0) {
                        // Only populate if the developer provided no manual fields
                        section.fields = buildFieldsFromEditTools(spec.editTools, section.action);
                    }
                }
                break;
            }
            case 'toggle': {
                if ('action' in section && section.action === '__TOGGLE_ACTION__') {
                    const toggleTool = spec.editTools.find(e => e.type === 'toggle-switch');
                    if (toggleTool) {
                        section.action = toggleTool.actionName;
                        section.label = toggleTool.label;
                    }
                }
                break;
            }
            case 'tag-input': {
                if ('action' in section && (section.action === '__FILTER_ACTION__' || section.action === '')) {
                    const tagTool = spec.editTools.find(e => e.type === 'tag-input');
                    if (tagTool)
                        section.action = tagTool.actionName;
                }
                break;
            }
            case 'select': {
                if ('action' in section && (section.action === '__SORT_ACTION__' || section.action === '')) {
                    const selectTool = spec.editTools.find(e => e.type === 'select-dropdown');
                    if (selectTool)
                        section.action = selectTool.actionName;
                }
                break;
            }
        }
    }
    // Step 3B: Remove dead scaffold sections whose action was never wired
    // (placeholder still present means no matching editTool was declared)
    const DEAD_PLACEHOLDERS = ['__FILTER_ACTION__', '__SORT_ACTION__', '__TOGGLE_ACTION__'];
    const wiredSections = sections.filter(s => {
        if ('action' in s && typeof s.action === 'string') {
            return !DEAD_PLACEHOLDERS.includes(s.action);
        }
        return true;
    });
    sections.length = 0;
    sections.push(...wiredSections);
    // Step 3C: Inject sections for editTools not yet referenced by any section action
    const referencedActions = new Set(sections
        .filter(s => 'action' in s)
        .map(s => s.action));
    // Also include card-list actionButton actions so toggle-switch tools wired there
    // are not double-injected as a global toggle section.
    for (const s of sections) {
        if (s.type === 'card-list') {
            const ab = s.actionButton;
            if (ab?.actionName)
                referencedActions.add(ab.actionName);
        }
    }
    for (const tool of spec.editTools) {
        if (referencedActions.has(tool.actionName))
            continue;
        switch (tool.type) {
            case 'form-submit':
            case 'inline-text-edit': {
                const injected = {
                    id: `injected-form-${tool.actionName}`,
                    type: 'action-form',
                    title: tool.label,
                    action: tool.actionName,
                    submitLabel: tool.label,
                    fields: buildFieldsFromEditTools(spec.editTools, tool.actionName),
                };
                sections.push(injected);
                referencedActions.add(tool.actionName);
                break;
            }
            case 'tag-input': {
                const injected = {
                    id: `injected-tag-${tool.actionName}`,
                    type: 'tag-input',
                    title: tool.label,
                    action: tool.actionName,
                    paramName: 'tags',
                    placeholder: `${tool.label}…`,
                };
                sections.push(injected);
                referencedActions.add(tool.actionName);
                break;
            }
            case 'select-dropdown': {
                const injected = {
                    id: `injected-select-${tool.actionName}`,
                    type: 'select',
                    title: tool.label,
                    options: [],
                    action: tool.actionName,
                    paramName: 'value',
                };
                sections.push(injected);
                referencedActions.add(tool.actionName);
                break;
            }
            case 'toggle-switch': {
                const injected = {
                    id: `injected-toggle-${tool.actionName}`,
                    type: 'toggle',
                    label: tool.label,
                    action: tool.actionName,
                    paramName: 'enabled',
                };
                sections.push(injected);
                referencedActions.add(tool.actionName);
                break;
            }
            case 'table-row-editor': {
                // Wire into the first table section's action-button column
                const tableSection = sections.find(s => s.type === 'table');
                if (tableSection && 'columns' in tableSection) {
                    tableSection.columns.push({ key: tool.actionName, label: tool.label, type: 'action-button', actionName: tool.actionName });
                    referencedActions.add(tool.actionName);
                }
                break;
            }
        }
    }
    // Step 3D: Promote text-summary to card-list when the wired output is an array type
    const ARRAY_OUTPUT_TYPES = new Set([
        'calendar-events', 'task-list', 'contact-list', 'scored-list',
        'recommendation-list', 'notification', 'travel-buffer-event', 'email',
    ]);
    for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        if (s.type !== 'text-summary')
            continue;
        const dataKey = s.dataKey;
        // Find which output this section was wired to
        const matchedOutput = spec.dataOutputs.find(o => o.rawContextKey === dataKey);
        if (matchedOutput && ARRAY_OUTPUT_TYPES.has(matchedOutput.type)) {
            sections[i] = {
                id: s.id,
                type: 'card-list',
                title: s.title,
                dataKey,
                titleKey: 'title',
                subtitleKey: 'subtitle',
            };
        }
    }
    // Step 4: Append agent-embed sections for each child agent
    if (spec.childAgentIds && spec.childAgentIds.length > 0) {
        for (const childId of spec.childAgentIds) {
            const embedSection = {
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
    const layout = scaffold.layout === 'two-column' ? 'two-column' :
        sectionCount >= 4 ? 'two-column' : 'single-column';
    return { layout, sections };
}
/**
 * Derive simple form fields from an editTool's actionName and the spec's outputs.
 * Only generates a minimal text field for the most common input parameters.
 * The developer portal can override these.
 */
function buildFieldsFromEditTools(editTools, actionName) {
    const tool = editTools.find(e => e.actionName === actionName);
    if (!tool)
        return [];
    // Use explicitly declared fields when the agent provides them
    if (tool.fields && tool.fields.length > 0) {
        return tool.fields;
    }
    // Generic single-field form as a baseline — developer fills in proper fields
    // in the developer portal's customize step.
    return [
        { name: 'input', label: tool.label, inputType: 'text', required: true },
    ];
}
//# sourceMappingURL=adapter.js.map