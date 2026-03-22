import type { ContextEntry } from "../model/context.ts";
import { parseFrontmatter } from "../utils/frontmatter.ts";

/**
 * A typed unit of knowledge extracted from memory files.
 * This is the intermediate representation — harness-agnostic.
 */
export interface KnowledgeUnit {
  /** What kind of knowledge this is */
  kind:
    | "user-profile"
    | "feedback"
    | "preference"
    | "system-info"
    | "project"
    | "reference"
    | "history";
  /** Short identifier */
  name: string;
  /** One-line summary for index/discovery */
  summary: string;
  /** Full content */
  content: string;
  /** Priority: how important is this for a new agent to know? 1=critical, 2=important, 3=contextual */
  priority: 1 | 2 | 3;
  /** Source file this was extracted from */
  source: string;
}

/**
 * Extract structured knowledge units from Claude Code memory entries.
 * Understands both frontmatter-typed files and plain markdown topic files.
 */
export function extractKnowledge(memoryEntries: ContextEntry[]): KnowledgeUnit[] {
  const units: KnowledgeUnit[] = [];
  const indexEntry = memoryEntries.find((e) => e.name === "MEMORY.md");

  // Process the index first — it tells us what's critical
  if (indexEntry) {
    units.push(...extractFromIndex(indexEntry));
  }

  // Process each topic file
  for (const entry of memoryEntries) {
    if (entry.name === "MEMORY.md") continue;
    units.push(...extractFromTopicFile(entry));
  }

  return units.sort((a, b) => a.priority - b.priority);
}

function extractFromIndex(entry: ContextEntry): KnowledgeUnit[] {
  // The MEMORY.md index contains brief pointers and critical-path summaries.
  // Extract the owner/user section as a high-priority profile unit.
  const units: KnowledgeUnit[] = [];
  const sections = splitSections(entry.content);

  for (const section of sections) {
    if (!section.heading) continue;

    // User identity sections are critical
    if (
      section.heading.match(/owner|user|about/i) ||
      section.content.match(/principal engineer|working style|core drive/i)
    ) {
      units.push({
        kind: "user-profile",
        name: "owner-profile",
        summary: `User identity and working style from ${entry.name}`,
        content: section.content,
        priority: 1,
        source: entry.sourcePath,
      });
    }

    // Critical feedback sections
    if (section.heading.match(/critical feedback/i)) {
      units.push({
        kind: "feedback",
        name: "critical-feedback-index",
        summary: "Index of critical corrections the user has given",
        content: section.content,
        priority: 1,
        source: entry.sourcePath,
      });
    }

    // Design principles
    if (section.heading.match(/design principles/i)) {
      units.push({
        kind: "preference",
        name: "design-principles",
        summary: "Established design principles for the project",
        content: section.content,
        priority: 2,
        source: entry.sourcePath,
      });
    }

    // Environment info
    if (section.heading.match(/environment/i)) {
      units.push({
        kind: "system-info",
        name: "environment",
        summary: "System environment details (PATH, tools, OS)",
        content: section.content,
        priority: 2,
        source: entry.sourcePath,
      });
    }
  }

  return units;
}

function extractFromTopicFile(entry: ContextEntry): KnowledgeUnit[] {
  const { frontmatter, body } = parseFrontmatter(entry.content);

  // Files with type frontmatter — feedback, user, project, reference
  if (frontmatter.type) {
    return [classifyByType(frontmatter, body, entry)];
  }

  // Plain markdown topic files — classify by filename and content
  return [classifyByContent(entry)];
}

function classifyByType(
  fm: Record<string, string>,
  body: string,
  entry: ContextEntry,
): KnowledgeUnit {
  const type = fm.type!;
  const name = fm.name || entry.name.replace(/\.md$/, "");
  const description = fm.description || "";

  switch (type) {
    case "feedback":
      return {
        kind: "feedback",
        name,
        summary: description,
        content: body.trim(),
        priority: 1, // Feedback is always high priority — prevents repeat mistakes
        source: entry.sourcePath,
      };
    case "user":
      return {
        kind: "user-profile",
        name,
        summary: description,
        content: body.trim(),
        priority: 1,
        source: entry.sourcePath,
      };
    case "project":
      return {
        kind: "project",
        name,
        summary: description,
        content: body.trim(),
        priority: 2,
        source: entry.sourcePath,
      };
    case "reference":
      return {
        kind: "reference",
        name,
        summary: description,
        content: body.trim(),
        priority: 3,
        source: entry.sourcePath,
      };
    default:
      return {
        kind: "reference",
        name,
        summary: description || `${type} memory: ${name}`,
        content: body.trim(),
        priority: 3,
        source: entry.sourcePath,
      };
  }
}

function classifyByContent(entry: ContextEntry): KnowledgeUnit {
  const name = entry.name.replace(/\.md$/, "");
  const content = entry.content;

  // Filename-based heuristics
  if (name.match(/preference/i)) {
    return {
      kind: "preference",
      name,
      summary: "User preferences and working style",
      content,
      priority: 1,
      source: entry.sourcePath,
    };
  }

  if (name.match(/contact/i)) {
    return {
      kind: "user-profile",
      name,
      summary: "People and accounts the user works with",
      content,
      priority: 2,
      source: entry.sourcePath,
    };
  }

  if (name.match(/system/i)) {
    return {
      kind: "system-info",
      name,
      summary: "Infrastructure and system configuration",
      content,
      priority: 2,
      source: entry.sourcePath,
    };
  }

  if (name.match(/history/i)) {
    return {
      kind: "history",
      name,
      summary: "Decision history and session log",
      content,
      priority: 3,
      source: entry.sourcePath,
    };
  }

  if (name.match(/feedback/i)) {
    return {
      kind: "feedback",
      name,
      summary: `Feedback: ${name}`,
      content,
      priority: 1,
      source: entry.sourcePath,
    };
  }

  // Default: contextual reference
  return {
    kind: "reference",
    name,
    summary: `Topic: ${name}`,
    content,
    priority: 3,
    source: entry.sourcePath,
  };
}

interface Section {
  heading: string | null;
  content: string;
}

function splitSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        sections.push({ heading: currentHeading, content: currentLines.join("\n").trim() });
      }
      currentHeading = headingMatch[1]!;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    sections.push({ heading: currentHeading, content: currentLines.join("\n").trim() });
  }

  return sections;
}
