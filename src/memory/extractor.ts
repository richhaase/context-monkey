import type { CanonicalMemory, ContextEntry } from "../model/context.ts";

/**
 * A typed unit of knowledge extracted from memory files.
 * This is a re-export of the canonical memory shape for backward compat.
 */
export interface KnowledgeUnit {
  kind: CanonicalMemory["kind"];
  name: string;
  summary: string;
  content: string;
  priority: 1 | 2 | 3;
  source: string;
}

/**
 * Extract structured knowledge units from memory entries.
 * Since scanners now normalize into CanonicalMemory, this is mostly a projection.
 */
export function extractKnowledge(memoryEntries: ContextEntry[]): KnowledgeUnit[] {
  const units: KnowledgeUnit[] = [];

  for (const entry of memoryEntries) {
    if (entry.canonical.type !== "memory") continue;
    const c = entry.canonical;
    units.push({
      kind: c.kind,
      name: c.name,
      summary: c.summary,
      content: c.content,
      priority: c.priority,
      source: entry.sourcePath,
    });
  }

  return units.sort((a, b) => a.priority - b.priority);
}
