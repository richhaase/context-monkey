import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { groupBy, kindDisplayName } from "../memory/render.ts";
import type { CanonicalMemory, ContextEntry } from "../model/context.ts";
import { serializeFrontmatter } from "../utils/frontmatter.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

const CLAUDE_DIR = join(homedir(), ".claude");

export const claudeCodeWriter: Writer = {
  id: "claude-code",
  displayName: "Claude Code",

  async plan(entries: ContextEntry[], workspaceRoot?: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];
    const baseDir = workspaceRoot ? join(workspaceRoot, ".claude") : CLAUDE_DIR;
    const instructionPath = workspaceRoot
      ? join(workspaceRoot, "CLAUDE.md")
      : join(CLAUDE_DIR, "CLAUDE.md");

    // Batch memory entries for aggregated handling
    const memoryEntries: CanonicalMemory[] = [];
    const instructionEntries: ContextEntry[] = [];
    const otherEntries: ContextEntry[] = [];

    for (const entry of entries) {
      if (entry.canonical.type === "memory") {
        memoryEntries.push(entry.canonical);
      } else if (entry.canonical.type === "instruction") {
        instructionEntries.push(entry);
      } else {
        otherEntries.push(entry);
      }
    }

    if (instructionEntries.length > 0) {
      actions.push(
        await fileAction(
          instructionPath,
          renderInstructionBundle(instructionEntries),
          instructionEntries[0]!,
        ),
      );
    }

    // Handle non-memory entries
    for (const entry of otherEntries) {
      const c = entry.canonical;

      switch (c.type) {
        case "skill": {
          const path = join(baseDir, "skills", sanitizeFlatName(c.name), "SKILL.md");
          const content = serializeFrontmatter(
            { description: c.description, ...(c.trigger ? { trigger: c.trigger } : {}) },
            c.instructions,
          );
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "agent": {
          const path = join(baseDir, "skills", sanitizeFlatName(c.name), "SKILL.md");
          const fm: Record<string, string> = { description: c.description, context: "fork" };
          if (c.model) fm.model = c.model;
          const content = serializeFrontmatter(fm, c.instructions);
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "command": {
          const path = join(baseDir, "commands", `${sanitizeNestedName(c.name)}.md`);
          actions.push(await fileAction(path, c.prompt, entry));
          break;
        }
        case "setting":
          actions.push(skip(entry, "Settings sync requires merging JSON"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync requires JSON merge — not yet supported"));
          break;
        case "ignore":
          actions.push(skip(entry, "Claude Code has no ignore file format"));
          break;
        case "instruction":
          break;
      }
    }

    // Handle memory: Claude Code gets the richest format — topic files + MEMORY.md index
    if (memoryEntries.length > 0) {
      const placeholder: ContextEntry = {
        category: "memory",
        name: "memory (aggregated)",
        canonical: memoryEntries[0]!,
        sourcePath: "",
        scope: "global",
        raw: "",
      };

      const grouped = groupBy(memoryEntries, (u) => u.kind);
      const memoryDir = join(baseDir, "memory");

      // Generate MEMORY.md index
      const indexLines = ["# Memory\n", "Auto-imported context. Details in topic files.\n"];
      for (const [kind, kindUnits] of Object.entries(grouped)) {
        indexLines.push(`## ${kindDisplayName(kind as CanonicalMemory["kind"])}`);
        for (const unit of kindUnits) {
          indexLines.push(`- **${unit.name}**: ${unit.summary}`);
        }
        indexLines.push("");
      }
      actions.push(
        await fileAction(join(memoryDir, "MEMORY.md"), indexLines.join("\n"), placeholder),
      );

      // Generate topic files for feedback
      for (const unit of grouped.feedback || []) {
        const filename = `feedback_${unit.name.replace(/[^a-z0-9-]/gi, "_")}.md`;
        const content = `---\nname: ${unit.name}\ndescription: ${unit.summary}\ntype: feedback\n---\n\n${unit.content}`;
        actions.push(await fileAction(join(memoryDir, filename), content, placeholder));
      }

      // Preferences as a single file
      const prefUnits = grouped.preference || [];
      if (prefUnits.length > 0) {
        const content = prefUnits.map((u) => u.content).join("\n\n");
        actions.push(await fileAction(join(memoryDir, "preferences.md"), content, placeholder));
      }
    }

    return { source: "claude-code", target: "claude-code", actions };
  },

  async execute(plan: SyncPlan): Promise<void> {
    for (const action of plan.actions) {
      if (action.type === "skip" || !action.content) continue;
      const dir = dirname(action.path);
      if (!(await exists(dir))) {
        await mkdir(dir, { recursive: true });
      }
      await Bun.write(action.path, action.content);
    }
  },
};

async function fileAction(path: string, content: string, entry: ContextEntry): Promise<SyncAction> {
  const existingFile = Bun.file(path);
  const fileExists = await existingFile.exists();
  return {
    type: fileExists ? "update" : "create",
    path,
    content,
    entry,
    existing: fileExists ? await existingFile.text() : undefined,
  };
}

function skip(entry: ContextEntry, reason: string): SyncAction {
  return { type: "skip", path: "", entry, reason };
}

function sanitizeFlatName(name: string): string {
  return name.replace(/[:/\\]/g, "-");
}

function sanitizeNestedName(name: string): string {
  return name.replace(/:/g, "-");
}

function renderInstructionBundle(entries: ContextEntry[]): string {
  if (entries.length === 1 && entries[0]!.canonical.type === "instruction") {
    return entries[0]!.canonical.body;
  }

  const sections: string[] = [];
  for (const entry of entries) {
    if (entry.canonical.type !== "instruction") continue;
    sections.push(`<!-- Source: ${entry.name} -->\n${entry.canonical.body.trim()}`);
  }
  return sections.join("\n\n");
}
