import type { HarnessId } from "../model/context.ts";
import type { KnowledgeUnit } from "./extractor.ts";

/**
 * A translated memory document ready to be written to a target harness.
 */
export interface TranslatedMemory {
  /** Where to write this in the target harness */
  targetPath: string;
  /** Human-readable description of what this is */
  description: string;
  /** The translated content */
  content: string;
  /** How it should be applied: replace the file, append to it, or create a new section */
  mode: "replace" | "append" | "section";
}

/**
 * Translate extracted knowledge into a format the target harness can consume.
 */
export function translateMemory(
  units: KnowledgeUnit[],
  targetHarness: HarnessId,
  root: string,
): TranslatedMemory[] {
  switch (targetHarness) {
    case "claude-code":
      return translateToClaudeCode(units, root);
    case "codex":
      return translateToCodex(units, root);
    case "gemini":
      return translateToGemini(units, root);
    case "cursor":
      return translateToCursor(units, root);
    case "copilot":
      return translateToCopilot(units, root);
  }
}

/**
 * Claude Code: structured topic files with MEMORY.md index.
 * This is the richest format — we can preserve all structure.
 */
function translateToClaudeCode(units: KnowledgeUnit[], root: string): TranslatedMemory[] {
  const results: TranslatedMemory[] = [];

  // Group units by kind for topic files
  const grouped = groupBy(units, (u) => u.kind);

  // Generate MEMORY.md index
  const indexLines = ["# Memory\n", "Auto-imported context. Details in topic files.\n"];

  for (const [kind, kindUnits] of Object.entries(grouped)) {
    indexLines.push(`## ${kindDisplayName(kind as KnowledgeUnit["kind"])}`);
    for (const unit of kindUnits) {
      indexLines.push(`- **${unit.name}**: ${unit.summary}`);
    }
    indexLines.push("");
  }

  results.push({
    targetPath: `${root}/memory/MEMORY.md`,
    description: "Memory index — auto-loaded each session",
    content: indexLines.join("\n"),
    mode: "replace",
  });

  // Generate topic files for feedback units (highest fidelity)
  const feedbackUnits = grouped.feedback || [];
  for (const unit of feedbackUnits) {
    results.push({
      targetPath: `${root}/memory/feedback_${unit.name.replace(/[^a-z0-9-]/gi, "_")}.md`,
      description: `Feedback: ${unit.summary}`,
      content: `---\nname: ${unit.name}\ndescription: ${unit.summary}\ntype: feedback\n---\n\n${unit.content}`,
      mode: "replace",
    });
  }

  // Preferences as a single file
  const prefUnits = grouped.preference || [];
  if (prefUnits.length > 0) {
    results.push({
      targetPath: `${root}/memory/preferences.md`,
      description: "User preferences and working style",
      content: prefUnits.map((u) => u.content).join("\n\n"),
      mode: "replace",
    });
  }

  return results;
}

/**
 * Codex: has its own MEMORY.md system with memory_summary.md.
 * We generate a MEMORY.md that Codex's consolidation agent can work with,
 * plus inject critical context into AGENTS.md.
 */
function translateToCodex(units: KnowledgeUnit[], root: string): TranslatedMemory[] {
  const results: TranslatedMemory[] = [];

  // Critical context goes into AGENTS.md as a "Known Context" section
  const critical = units.filter((u) => u.priority === 1);
  if (critical.length > 0) {
    const agentsSection = renderContextSection(critical, "Known Context", [
      "This context was ported from another agent environment.",
      "Treat it as established knowledge — the user should not need to re-teach these things.",
    ]);

    results.push({
      targetPath: `${root}/AGENTS.md`,
      description: "Critical user context appended to AGENTS.md",
      content: agentsSection,
      mode: "append",
    });
  }

  // Full memory goes into .codex/MEMORY.md for the consolidation agent
  const memoryDoc = renderFullMemoryDoc(units);
  results.push({
    targetPath: `${root}/.codex/MEMORY.md`,
    description: "Full memory for Codex consolidation — all priorities",
    content: memoryDoc,
    mode: "replace",
  });

  return results;
}

/**
 * Gemini CLI: memory is appended to GEMINI.md under ## Gemini Added Memories.
 * We also inject critical context as top-level sections.
 */
function translateToGemini(units: KnowledgeUnit[], root: string): TranslatedMemory[] {
  const results: TranslatedMemory[] = [];

  // Critical context as a dedicated section in GEMINI.md
  const critical = units.filter((u) => u.priority === 1);
  const important = units.filter((u) => u.priority === 2);
  const contextual = units.filter((u) => u.priority === 3);

  const sections: string[] = [];

  if (critical.length > 0) {
    sections.push(
      renderContextSection(critical, "Known Context (Critical)", [
        "This context was ported from another agent environment.",
        "These are high-priority items — corrections, preferences, and identity that must be respected.",
      ]),
    );
  }

  if (important.length > 0) {
    sections.push(
      renderContextSection(important, "Known Context (Important)", [
        "System and project context from another agent environment.",
      ]),
    );
  }

  // Gemini's native memory section
  if (contextual.length > 0) {
    const memoryLines = ["## Gemini Added Memories\n"];
    for (const unit of contextual) {
      memoryLines.push(`- **${unit.name}**: ${unit.summary}`);
    }
    sections.push(memoryLines.join("\n"));
  }

  results.push({
    targetPath: `${root}/GEMINI.md`,
    description: "User context and memory ported to Gemini format",
    content: sections.join("\n\n"),
    mode: "append",
  });

  return results;
}

/**
 * Cursor: no memory system. Inject critical context into a dedicated rule file.
 * Uses MDC format with frontmatter.
 */
function translateToCursor(units: KnowledgeUnit[], root: string): TranslatedMemory[] {
  const critical = units.filter((u) => u.priority <= 2);
  if (critical.length === 0) return [];

  const body = renderContextSection(critical, "Known User Context", [
    "This context was ported from another agent environment.",
    "Treat as established — do not ask the user to re-explain these things.",
  ]);

  const content = `---\ndescription: "Ported user context and preferences — always apply"\nalwaysApply: "true"\n---\n${body}`;

  return [
    {
      targetPath: `${root}/.cursor/rules/user-context.mdc`,
      description: "User context and preferences as an always-on Cursor rule",
      content,
      mode: "replace",
    },
  ];
}

/**
 * Copilot: no memory system. Inject into copilot-instructions.md.
 */
function translateToCopilot(units: KnowledgeUnit[], root: string): TranslatedMemory[] {
  const critical = units.filter((u) => u.priority <= 2);
  if (critical.length === 0) return [];

  const body = renderContextSection(critical, "Known User Context", [
    "This context was ported from another agent environment.",
    "Treat as established knowledge.",
  ]);

  return [
    {
      targetPath: `${root}/.github/copilot-instructions.md`,
      description: "User context appended to Copilot instructions",
      content: body,
      mode: "append",
    },
  ];
}

// --- Rendering helpers ---

function renderContextSection(units: KnowledgeUnit[], heading: string, preamble: string[]): string {
  const lines = [`## ${heading}\n`];
  for (const p of preamble) {
    lines.push(`> ${p}`);
  }
  lines.push("");

  // Group by kind within the section
  const grouped = groupBy(units, (u) => u.kind);

  for (const [kind, kindUnits] of Object.entries(grouped)) {
    lines.push(`### ${kindDisplayName(kind as KnowledgeUnit["kind"])}\n`);
    for (const unit of kindUnits) {
      // For short content, inline it. For long content, use a summary + body.
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

function renderFullMemoryDoc(units: KnowledgeUnit[]): string {
  const lines = ["# Memory\n", "Ported from another agent environment.\n"];
  const grouped = groupBy(units, (u) => u.kind);

  for (const [kind, kindUnits] of Object.entries(grouped)) {
    lines.push(`## ${kindDisplayName(kind as KnowledgeUnit["kind"])}\n`);
    for (const unit of kindUnits) {
      lines.push(`### ${unit.name}\n`);
      lines.push(`> ${unit.summary}\n`);
      lines.push(unit.content);
      lines.push("");
    }
  }

  return lines.join("\n");
}

function kindDisplayName(kind: KnowledgeUnit["kind"]): string {
  const names: Record<KnowledgeUnit["kind"], string> = {
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

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!result[k]) result[k] = [];
    result[k].push(item);
  }
  return result;
}
