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
import type { AgentUXSpec, AgentPanelSpec, AdaptOptions } from './types';
export declare function adapt(spec: AgentUXSpec, _options?: AdaptOptions): AgentPanelSpec;
//# sourceMappingURL=adapter.d.ts.map