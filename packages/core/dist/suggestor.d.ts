/**
 * suggestor.ts — Developer portal suggestion engine
 *
 * Given a partial AgentUXSpec being filled in step-by-step,
 * returns suggestions for the next unfilled field.
 *
 * Rule-based for all fields except the final "fill gaps" path,
 * which can optionally call an LLM if context.llmFallback is true.
 */
import type { AgentUXSpec, SuggestionResult, SuggestContext } from './types';
/**
 * Given a partial spec and optional free-text context, suggest the next field.
 */
export declare function suggest(partial: Partial<AgentUXSpec>, context?: SuggestContext): SuggestionResult;
//# sourceMappingURL=suggestor.d.ts.map