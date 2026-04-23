"use strict";
/**
 * suggestor.ts — Developer portal suggestion engine
 *
 * Given a partial AgentUXSpec being filled in step-by-step,
 * returns suggestions for the next unfilled field.
 *
 * Rule-based for all fields except the final "fill gaps" path,
 * which can optionally call an LLM if context.llmFallback is true.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggest = suggest;
// Keyword → architecture mapping (confidence thresholds: 2+ matches = high, 1 = medium)
const ARCH_KEYWORDS = {
    'calendar-view': ['calendar', 'schedule', 'event', 'appointment', 'booking', 'meeting', 'time'],
    'table': ['table', 'list', 'records', 'history', 'log', 'score', 'evaluate', 'rank', 'analyse'],
    'form-result': ['calculate', 'compute', 'estimate', 'optimise', 'optimize', 'plan', 'suggest', 'travel', 'route'],
    'dashboard': ['analytics', 'metrics', 'insights', 'trends', 'report', 'chart', 'usage', 'health', 'energy'],
    'card-feed': ['feed', 'discover', 'network', 'contact', 'digest', 'follow', 'todo', 'task', 'venue'],
    'settings-form': ['settings', 'configure', 'payment', 'subscription', 'manage', 'booking page'],
    'chat-augment': ['context', 'brief', 'assistant', 'augment', 'chat'],
    'flow-wizard': ['wizard', 'onboard', 'setup', 'step', 'workflow'],
};
// DataSource suggestions per architecture
const ARCH_SOURCES = {
    'calendar-view': [{ type: 'google-calendar', required: true }, { type: 'ical-feed', required: false }, { type: 'outlook-calendar', required: false }],
    'table': [{ type: 'supabase-internal', required: true }, { type: 'llm-inference', required: false }],
    'form-result': [{ type: 'supabase-internal', required: true }],
    'dashboard': [{ type: 'supabase-internal', required: true }, { type: 'google-calendar', required: false }],
    'card-feed': [{ type: 'supabase-internal', required: true }],
    'settings-form': [{ type: 'supabase-internal', required: true }],
    'chat-augment': [{ type: 'supabase-internal', required: true }, { type: 'llm-inference', required: true }],
    'flow-wizard': [{ type: 'supabase-internal', required: true }],
};
// DataOutput suggestions per architecture
const ARCH_OUTPUTS = {
    'calendar-view': ['calendar-events'],
    'table': ['scored-list'],
    'form-result': ['text-summary', 'recommendation-list'],
    'dashboard': ['metrics-chart', 'trend-report'],
    'card-feed': ['recommendation-list'],
    'settings-form': ['booking-record'],
    'chat-augment': ['text-summary'],
    'flow-wizard': ['text-summary'],
};
// Keyword → DataSource type refinements (applied on top of arch defaults)
const KEYWORD_SOURCES = [
    { keywords: ['email', 'gmail', 'digest'], source: 'gmail' },
    { keywords: ['maps', 'travel', 'route', 'venue', 'location'], source: 'google-maps' },
    { keywords: ['place', 'venue', 'restaurant', 'cafe'], source: 'google-places' },
    { keywords: ['contact', 'people', 'person'], source: 'google-people' },
    { keywords: ['scrape', 'scraper', 'web', 'crawl'], source: 'web-scraper' },
    { keywords: ['search', 'discover', 'trend', 'gemini'], source: 'gemini-search' },
    { keywords: ['task', 'todo', 'todoist'], source: 'todoist' },
    { keywords: ['stripe', 'payment', 'charge'], source: 'stripe' },
    { keywords: ['notion'], source: 'notion' },
    { keywords: ['llm', 'ai', 'generate', 'score', 'brief', 'explain'], source: 'llm-inference' },
];
function tokenise(text) {
    return text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
}
function countMatches(tokens, keywords) {
    return tokens.filter(t => keywords.includes(t)).length;
}
/**
 * Given a partial spec and optional free-text context, suggest the next field.
 */
function suggest(partial, context) {
    const desc = ((context?.agentName ?? '') + ' ' + (context?.description ?? '')).toLowerCase();
    const tokens = tokenise(desc);
    // Step 1: no baseArchitecture yet → suggest it
    if (!partial.baseArchitecture) {
        return suggestArchitecture(tokens);
    }
    // Step 2: no dataSources → suggest them
    if (!partial.dataSources || partial.dataSources.length === 0) {
        return suggestDataSources(partial.baseArchitecture, tokens);
    }
    // Step 3: no dataOutputs → suggest them
    if (!partial.dataOutputs || partial.dataOutputs.length === 0) {
        return suggestDataOutputs(partial.baseArchitecture, tokens);
    }
    // Step 4: no editTools → suggest them
    if (!partial.editTools || partial.editTools.length === 0) {
        return suggestEditTools(partial.baseArchitecture);
    }
    // Step 5: no contributes declared yet → suggest data contributions this agent could inject into others
    if (!partial.contributes) {
        return suggestContributions(partial.baseArchitecture);
    }
    // Step 6: no agentTools declared yet → suggest runtime tool calls
    if (!partial.agentTools) {
        return suggestAgentTools(partial.baseArchitecture);
    }
    // All steps done — nothing more to suggest
    return { field: 'autoAdapt', suggestions: [{ value: true, confidence: 'high', reason: 'Spec complete — enable auto-adapt to generate a panelSpec.' }] };
}
function suggestArchitecture(tokens) {
    const scored = [];
    for (const [arch, keywords] of Object.entries(ARCH_KEYWORDS)) {
        const score = countMatches(tokens, keywords);
        if (score > 0)
            scored.push({ arch, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const suggestions = scored.slice(0, 3).map(({ arch, score }) => ({
        value: arch,
        confidence: (score >= 2 ? 'high' : 'medium'),
        reason: `Description matches ${score} keyword${score > 1 ? 's' : ''} for "${arch}".`,
    }));
    if (suggestions.length === 0) {
        suggestions.push({ value: 'card-feed', confidence: 'low', reason: 'Default — no strong keyword match found.' });
    }
    return { field: 'baseArchitecture', suggestions };
}
function suggestDataSources(arch, tokens) {
    const baseSources = ARCH_SOURCES[arch] ?? [];
    const extra = [];
    for (const { keywords, source } of KEYWORD_SOURCES) {
        if (countMatches(tokens, keywords) > 0 && !baseSources.find(s => s.type === source)) {
            extra.push(source);
        }
    }
    const suggestions = [
        ...baseSources.map(s => ({
            value: { type: s.type, label: s.type.replace(/-/g, ' '), required: s.required },
            confidence: 'high',
            reason: `Standard data source for "${arch}" architecture.`,
        })),
        ...extra.map(s => ({
            value: { type: s, label: s.replace(/-/g, ' '), required: false },
            confidence: 'medium',
            reason: `Detected keyword match for "${s}" in description.`,
        })),
    ];
    return { field: 'dataSources', suggestions };
}
function suggestDataOutputs(arch, _tokens) {
    const outputs = ARCH_OUTPUTS[arch] ?? ['text-summary'];
    const suggestions = outputs.map(o => ({
        value: { type: o, label: o.replace(/-/g, ' '), rawContextKey: o.replace(/-/g, '_') },
        confidence: 'high',
        reason: `Standard output type for "${arch}" architecture.`,
    }));
    return { field: 'dataOutputs', suggestions };
}
function suggestEditTools(arch) {
    const toolMap = {
        'calendar-view': [{ type: 'calendar-card-editor', label: 'Create event' }, { type: 'toggle-switch', label: 'Toggle all-day' }],
        'table': [{ type: 'table-row-editor', label: 'Edit row' }, { type: 'tag-input', label: 'Filter tags' }],
        'form-result': [{ type: 'form-submit', label: 'Submit' }],
        'dashboard': [{ type: 'select-dropdown', label: 'Time range' }, { type: 'form-submit', label: 'Refresh' }],
        'card-feed': [{ type: 'tag-input', label: 'Filter' }, { type: 'form-submit', label: 'Add item' }],
        'settings-form': [{ type: 'form-submit', label: 'Save settings' }],
        'chat-augment': [{ type: 'toggle-switch', label: 'Auto-push context' }],
        'flow-wizard': [{ type: 'form-submit', label: 'Next step' }],
    };
    const tools = toolMap[arch] ?? [{ type: 'form-submit', label: 'Submit' }];
    const suggestions = tools.map(t => ({
        value: { type: t.type, actionName: '', label: t.label },
        confidence: 'high',
        reason: `Recommended edit tool for "${arch}" architecture.`,
    }));
    return { field: 'editTools', suggestions };
}
function suggestContributions(arch) {
    // Contribution suggestions — what data does this agent inject INTO another agent's rawContext?
    const contribMap = {
        'form-result': [
            { targetAgentId: 'calendar-aggregator', targetKey: 'travel_buffer_events', fromOutputKey: 'bufferedEvents', strategy: 'append', label: 'Travel buffer events', reason: 'Inject travel-buffer events into the calendar aggregator view.' },
            { targetAgentId: 'event-scraper', targetKey: 'travel_time_estimates', fromOutputKey: 'updatedEvents', strategy: 'augment', label: 'Travel time estimates', reason: 'Annotate scraped events with travel time estimates.' },
        ],
        'dashboard': [
            { targetAgentId: 'calendar-aggregator', targetKey: 'energy_scores', fromOutputKey: 'loadScore', strategy: 'augment', label: 'Energy load scores', reason: 'Augment calendar events with energy-load scores.' },
        ],
        'table': [
            { targetAgentId: 'event-scraper', targetKey: 'scored_events', fromOutputKey: 'scoredEvents', strategy: 'replace', label: 'Scored events', reason: 'Replace raw event list with evaluated+scored records.' },
        ],
        'card-feed': [
            { targetAgentId: 'social-planner', targetKey: 'venue_suggestions', fromOutputKey: 'venues', strategy: 'augment', label: 'Venue suggestions', reason: 'Inject venue suggestions into social plan.' },
            { targetAgentId: 'friends-network', targetKey: 'venue_options', fromOutputKey: 'venues', strategy: 'augment', label: 'Venue options for friends', reason: 'Suggest venues for friend meetup cards.' },
        ],
        'settings-form': [
            { targetAgentId: 'customer-booking', targetKey: 'payment_records', fromOutputKey: 'payments', strategy: 'augment', label: 'Payment records', reason: 'Inject payment status into booking records.' },
        ],
        'calendar-view': [],
        'chat-augment': [],
        'flow-wizard': [],
    };
    const contribs = contribMap[arch] ?? [];
    if (contribs.length === 0) {
        return { field: 'contributes', suggestions: [{ value: [], confidence: 'high', reason: 'This architecture does not typically contribute data to other agents.' }] };
    }
    const suggestions = contribs.map(c => ({
        value: { targetAgentId: c.targetAgentId, targetDataKey: c.targetKey, fromOutputKey: c.fromOutputKey, mergeStrategy: c.strategy, label: c.label },
        confidence: 'medium',
        reason: c.reason,
    }));
    return { field: 'contributes', suggestions };
}
function suggestAgentTools(arch) {
    // AgentTools suggestions — what other agent's actions does this agent call at runtime?
    const toolMap = {
        'form-result': [
            { providerAgentId: 'travel-time', actionName: 'estimateTravelTime', label: 'Estimate travel time', reason: 'Call travel-time agent to compute buffers.' },
        ],
        'card-feed': [
            { providerAgentId: 'venue-suggester', actionName: 'getSuggestions', label: 'Get venue suggestions', reason: 'Fetch venue options from venue-suggester at runtime.' },
        ],
        'settings-form': [
            { providerAgentId: 'calendar-aggregator', actionName: 'getAvailability', label: 'Check availability', reason: 'Check host calendar availability when booking.' },
        ],
        'table': [
            { providerAgentId: 'event-evaluator', actionName: 'scoreEvent', label: 'Score event', reason: 'Delegate scoring to event-evaluator agent.' },
        ],
        'calendar-view': [],
        'dashboard': [],
        'chat-augment': [],
        'flow-wizard': [],
    };
    const tools = toolMap[arch] ?? [];
    if (tools.length === 0) {
        return { field: 'agentTools', suggestions: [{ value: [], confidence: 'high', reason: 'This architecture does not typically call other agents as tools.' }] };
    }
    const suggestions = tools.map(t => ({
        value: { agentId: t.providerAgentId, actionName: t.actionName, label: t.label, invokeOn: 'on-action' },
        confidence: 'medium',
        reason: t.reason,
    }));
    return { field: 'agentTools', suggestions };
}
//# sourceMappingURL=suggestor.js.map