/**
 * mapper.ts — Rule table: BaseArchitecture → PanelSection[] scaffold
 *
 * Pure rule-based. No LLM dependency. Every architecture maps to a predictable
 * set of section types. The adapter enriches these with real dataKeys and actionNames.
 */
import type { BaseArchitecture, DataOutputDeclaration, EditToolDeclaration } from './types';
export interface SectionScaffold {
    /** Ordered section type stubs — dataKey/action populated by adapter.ts */
    sections: Array<{
        type: string;
        id: string;
        title?: string;
        [key: string]: unknown;
    }>;
    /** Preferred layout */
    layout: 'single-column' | 'two-column';
}
/**
 * Returns the base section scaffold for a given architecture.
 * IDs are deterministic strings; the adapter fills in runtime values.
 */
export declare function getScaffold(arch: BaseArchitecture): SectionScaffold;
/**
 * Given a dataOutput type, return sensible default column definitions for table sections.
 */
export declare function defaultColumnsForOutput(outputType: DataOutputDeclaration['type']): Array<{
    key: string;
    label: string;
    type: 'text' | 'date' | 'badge';
}>;
/**
 * Returns the preferred actionName from editTools for a given edit tool type.
 */
export declare function resolveAction(editTools: EditToolDeclaration[], preferredTypes: EditToolDeclaration['type'][]): string;
//# sourceMappingURL=mapper.d.ts.map