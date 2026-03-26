import type { CanonicalMemory } from "../model/context.ts";

/** Group items by a key function. */
export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!result[k]) result[k] = [];
    result[k].push(item);
  }
  return result;
}

export function kindDisplayName(kind: CanonicalMemory["kind"]): string {
  const names: Record<CanonicalMemory["kind"], string> = {
    "user-profile": "User Profile",
    feedback: "Critical Feedback",
    preference: "Preferences",
    "system-info": "System & Environment",
    project: "Project Context",
    reference: "References",
    history: "History",
  };
  return names[kind];
}

/**
 * Render a markdown section from memory units with a heading and preamble.
 * Used by writers that inject memory into instruction files (Codex, Gemini, Cursor).
 */
export function renderContextSection(
  units: CanonicalMemory[],
  heading: string,
  preamble: string[],
): string {
  const lines = [`## ${heading}\n`];
  for (const p of preamble) {
    lines.push(`> ${p}`);
  }
  lines.push("");

  const grouped = groupBy(units, (u) => u.kind);

  for (const [kind, kindUnits] of Object.entries(grouped)) {
    lines.push(`### ${kindDisplayName(kind as CanonicalMemory["kind"])}\n`);
    for (const unit of kindUnits) {
      const contentLines = unit.content.split("\n").length;
      if (contentLines <= 5) {
        lines.push(`**${unit.name}**: ${unit.content}\n`);
      } else {
        lines.push(`**${unit.name}** — ${unit.summary}\n`);
        lines.push(unit.content);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

/**
 * Render a full memory document with all units organized by kind.
 * Used by writers that have dedicated memory files (Codex .codex/MEMORY.md).
 */
export function renderFullMemoryDoc(units: CanonicalMemory[]): string {
  const lines = ["# Memory\n", "Ported from another agent environment.\n"];
  const grouped = groupBy(units, (u) => u.kind);

  for (const [kind, kindUnits] of Object.entries(grouped)) {
    lines.push(`## ${kindDisplayName(kind as CanonicalMemory["kind"])}\n`);
    for (const unit of kindUnits) {
      lines.push(`### ${unit.name}\n`);
      lines.push(`> ${unit.summary}\n`);
      lines.push(unit.content);
      lines.push("");
    }
  }

  return lines.join("\n");
}
