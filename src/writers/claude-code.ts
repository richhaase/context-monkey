import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextEntry } from "../model/context.ts";
import { serializeFrontmatter } from "../utils/frontmatter.ts";
import { exists } from "../utils/fs.ts";
import type { SyncAction, SyncPlan, Writer } from "./writer.ts";

export const claudeCodeWriter: Writer = {
  id: "claude-code",
  displayName: "Claude Code",

  async plan(entries: ContextEntry[], root: string): Promise<SyncPlan> {
    const actions: SyncAction[] = [];

    for (const entry of entries) {
      const c = entry.canonical;

      switch (c.type) {
        case "instruction": {
          const path = join(root, "CLAUDE.md");
          actions.push(await fileAction(path, c.body, entry));
          break;
        }
        case "skill": {
          const path = join(root, ".claude", "skills", c.name, "SKILL.md");
          const content = serializeFrontmatter(
            { description: c.description, ...(c.trigger ? { trigger: c.trigger } : {}) },
            c.instructions,
          );
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "agent": {
          // Agents → skills with context: fork
          const path = join(root, ".claude", "skills", c.name, "SKILL.md");
          const fm: Record<string, string> = { description: c.description, context: "fork" };
          if (c.model) fm.model = c.model;
          const content = serializeFrontmatter(fm, c.instructions);
          actions.push(await fileAction(path, content, entry));
          break;
        }
        case "command": {
          const path = join(root, ".claude", "commands", `${c.name}.md`);
          actions.push(await fileAction(path, c.prompt, entry));
          break;
        }
        case "setting":
          actions.push(skip(entry, "Settings sync requires merging JSON — use cm settings"));
          break;
        case "memory":
          actions.push(skip(entry, "Use 'cm memory' for semantic memory translation"));
          break;
        case "mcp":
          actions.push(skip(entry, "MCP server sync requires JSON merge — not yet supported"));
          break;
        case "ignore":
          actions.push(skip(entry, "Claude Code has no ignore file format"));
          break;
      }
    }

    return { source: "claude-code", target: "claude-code", actions };
  },

  async execute(plan: SyncPlan, _root: string): Promise<void> {
    for (const action of plan.actions) {
      if (action.type === "skip" || !action.content) continue;
      const dir = join(action.path, "..");
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
